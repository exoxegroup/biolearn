import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, groupId } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user is enrolled in the class
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        classId: classId as string,
        studentId: req.user.id
      }
    });

    if (!enrollment && req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        classId: classId as string,
        groupId: groupId ? parseInt(groupId as string) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: limit
    });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, groupId, text } = req.body;

    if (!classId || !text) {
      return res.status(400).json({ error: 'Class ID and text are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify user is enrolled in the class
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        classId,
        studentId: req.user.id
      }
    });

    if (!enrollment && req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Not authorized to send messages in this chat' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        classId,
        groupId: groupId || null,
        senderId: req.user.id,
        text,
        isAI: false,
        timestamp: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only allow deletion by message sender or teacher
    if (message.senderId !== req.user.id && req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};