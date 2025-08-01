import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Initialize Google GenAI
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY,
});

// Test endpoint without authentication
router.post('/ai/test', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build context for the AI
    let fullContext = '';
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

    res.json({ response, success: true });
  } catch (error) {
    console.error('AI Test Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(500).json({ error: 'AI service configuration error - API key missing' });
      }
      if (error.message.includes('quota')) {
        return res.status(429).json({ error: 'AI service quota exceeded' });
      }
    }
    
    res.status(500).json({ error: 'Failed to generate AI response', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Health check endpoint
router.get('/ai/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI service is running',
    hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
  });
});

export default router;