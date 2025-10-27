
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import classRoutes from './routes/classRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import materialRoutes from './routes/materialRoutes';
import quizRoutes from './routes/quizRoutes';
import groupRoutes from './routes/groupRoutes';
import aiRoutes from './routes/aiRoutes';
import aiTestRoutes from './routes/ai-test-routes';
import chatRoutes from './routes/chatRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://biolearn.onrender.com', 'http://localhost:5173'],
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

app.use(cors({
  origin: ['https://biolearn.onrender.com', 'http://localhost:5173']
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Presence tracking
const onlineUsers = new Map<string, Set<string>>(); // classId -> Set of userIds
const socketUserMap = new Map<string, { classId: string; userId: string }>();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join class or group room
  socket.on('join_room', (data: { classId: string; groupId?: number; userId?: string }) => {
    const { classId, groupId, userId } = data;
    if (groupId) {
      const roomName = `group_${classId}_${groupId}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined group room: ${roomName}`);
    } else {
      const roomName = `class_${classId}`;
      socket.join(roomName);
      console.log(`User ${socket.id} joined class room: ${roomName}`);
    }
    
    // Track online users
    if (userId && classId) {
      if (!onlineUsers.has(classId)) {
        onlineUsers.set(classId, new Set());
      }
      onlineUsers.get(classId)!.add(userId);
      socketUserMap.set(socket.id, { classId, userId });
      
      // Broadcast updated online users list
      const onlineUserIds = Array.from(onlineUsers.get(classId)!);
      io.to(`class_${classId}`).emit('users:online', { onlineUsers: onlineUserIds });
    }
  });

  // Handle note updates for shared notes
  socket.on('note:update', async (data: {
    classId: string;
    groupId: number;
    content: string;
    userId: string;
  }) => {
    try {
      const { classId, groupId, content, userId } = data;
      
      // Save the note content to the database
      const updatedNote = await prisma.groupNote.upsert({
        where: {
          classId_groupId: {
            classId: classId,
            groupId: groupId
          }
        },
        update: {
          content: content,
          updatedAt: new Date()
        },
        create: {
          classId: classId,
          groupId: groupId,
          content: content
        }
      });

      // Broadcast the updated content to all members in the group
      const roomName = `group_${classId}_${groupId}`;
      socket.to(roomName).emit('note:updated', {
        content: updatedNote.content,
        updatedAt: updatedNote.updatedAt,
        updatedBy: userId
      });

      console.log(`Note updated for group ${groupId} in class ${classId}`);
    } catch (error) {
      console.error('Error updating note:', error);
      socket.emit('note:error', { error: 'Failed to update note' });
    }
  });

  // Handle chat messages
  socket.on('chat:message', async (data: {
    classId: string;
    groupId?: number;
    message: string;
    userId: string;
    userName: string;
  }) => {
    try {
      const { classId, groupId, message, userId, userName } = data;
      
      if (!message || !message.trim()) {
        socket.emit('chat:error', { error: 'Message cannot be empty' });
        return;
      }

      // Save message to database
      const savedMessage = await prisma.chatMessage.create({
        data: {
          classId,
          groupId: groupId || null,
          senderId: userId,
          text: message,
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

      // Determine room name for broadcasting
      const roomName = groupId ? `group_${classId}_${groupId}` : `class_${classId}`;
      
      // Broadcast message to all users in the room
      io.to(roomName).emit('chat:message:received', {
        id: savedMessage.id,
        text: savedMessage.text,
        timestamp: savedMessage.timestamp,
        sender: {
          id: savedMessage.sender.id,
          name: savedMessage.sender.name,
          role: savedMessage.sender.role
        },
        classId: savedMessage.classId,
        groupId: savedMessage.groupId
      });

      console.log(`Message sent to ${roomName}: ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error sending chat message:', error);
      socket.emit('chat:error', { error: 'Failed to send message' });
    }
  });

  // Handle chat history request
  socket.on('chat:history', async (data: {
    classId: string;
    groupId?: number;
    limit?: number;
  }) => {
    try {
      const { classId, groupId, limit = 50 } = data;
      
      const messages = await prisma.chatMessage.findMany({
        where: {
          classId,
          groupId: groupId || null
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

      socket.emit('chat:history:loaded', messages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      socket.emit('chat:error', { error: 'Failed to load chat history' });
    }
  });

  // Handle typing indicators
  socket.on('chat:typing', (data: {
    classId: string;
    groupId?: number;
    userName: string;
    isTyping: boolean;
  }) => {
    const { classId, groupId, userName, isTyping } = data;
    const roomName = groupId ? `group_${classId}_${groupId}` : `class_${classId}`;
    
    socket.to(roomName).emit('chat:typing:indicator', {
      userName,
      isTyping
    });
  });



  // Handle teacher controls
  socket.on('teacher:start-class', async (data: { classId: string }) => {
    try {
      const { classId } = data;
      
      // Update class status in database
      await prisma.class.update({
        where: { id: classId },
        data: { status: 'MAIN_SESSION' }
      });

      // Broadcast state change to all users in the class
      io.to(`class_${classId}`).emit('class:state-changed', { 
        status: 'MAIN_SESSION',
        message: 'Class has started' 
      });

      console.log(`Teacher started class ${classId}`);
    } catch (error) {
      console.error('Error starting class:', error);
      socket.emit('teacher:error', { error: 'Failed to start class' });
    }
  });

  socket.on('teacher:activate-groups', async (data: { classId: string }) => {
    try {
      const { classId } = data;
      
      // Update class status in database
      await prisma.class.update({
        where: { id: classId },
        data: { status: 'GROUP_SESSION' }
      });

      // Broadcast state change to all users in the class
      io.to(`class_${classId}`).emit('class:state-changed', { 
        status: 'GROUP_SESSION',
        message: 'Group session activated' 
      });

      console.log(`Teacher activated groups in class ${classId}`);
    } catch (error) {
      console.error('Error activating groups:', error);
      socket.emit('teacher:error', { error: 'Failed to activate groups' });
    }
  });

  socket.on('teacher:end-class', async (data: { classId: string }) => {
    try {
      const { classId } = data;
      
      // Update class status in database
      await prisma.class.update({
        where: { id: classId },
        data: { status: 'POSTTEST' }
      });

      // Broadcast state change to all users in the class
      io.to(`class_${classId}`).emit('class:state-changed', { 
        status: 'POSTTEST',
        message: 'Class ended - post-test available' 
      });

      console.log(`Teacher ended class ${classId}`);
    } catch (error) {
      console.error('Error ending class:', error);
      socket.emit('teacher:error', { error: 'Failed to end class' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from online users tracking
    const userData = socketUserMap.get(socket.id);
    if (userData) {
      const { classId, userId } = userData;
      
      if (onlineUsers.has(classId)) {
        onlineUsers.get(classId)!.delete(userId);
        
        // Broadcast updated online users list
        const onlineUserIds = Array.from(onlineUsers.get(classId)!);
        io.to(`class_${classId}`).emit('users:online', { onlineUsers: onlineUserIds });
      }
      
      socketUserMap.delete(socket.id);
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api', groupRoutes);
app.use('/api', aiTestRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.BACKEND_PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔄 Socket.io server ready`);
  setInterval(() => {
    console.log('Server is still running...');
  }, 2000);
});

server.on('error', (err) => {
  console.error('Server listen error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});