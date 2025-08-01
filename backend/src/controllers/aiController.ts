import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
});

interface AIQueryRequest {
  prompt: string;
  context?: string;
}

export const getAIResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, context } = req.body as AIQueryRequest;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build context for the AI
    let fullContext = '';
    if (context) {
      fullContext += `Context: ${context}\n\n`;
    }
    
    // Add user role context using authenticated user
    const userRole = req.user!.role.toLowerCase();
    fullContext += `User is a ${userRole} in this educational platform. `;
    
    // Add educational focus
    fullContext += `Please provide helpful, educational responses appropriate for a classroom setting. `;
    fullContext += `Keep responses concise and focused on the topic.\n\n`;
    fullContext += `User query: ${prompt}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fullContext,
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const response = result.text || 'I could not generate a response. Please try again.';

    // Log the AI interaction for analytics
    try {
      await prisma.chatMessage.create({
        data: {
          classId: req.body.classId || 'global',
          groupId: req.body.groupId || null,
          senderId: req.user!.id,
          text: prompt,
          isAI: true,
          timestamp: new Date()
        }
      });
    } catch (logError) {
      console.error('Error logging AI interaction:', logError);
    }

    res.json({ response });
  } catch (error) {
    console.error('AI API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'AI service configuration error' });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ error: 'AI service quota exceeded' });
      }
    }
    
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
};