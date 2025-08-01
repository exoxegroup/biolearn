import express from 'express';
import { getChatHistory, sendMessage, deleteMessage } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Enable JWT authentication for chat endpoints
router.use(protect);

// GET /api/chat/history - Get chat history for a class/group
router.get('/history', getChatHistory);

// POST /api/chat/message - Send a new message
router.post('/message', sendMessage);

// DELETE /api/chat/message/:messageId - Delete a message
router.delete('/message/:messageId', deleteMessage);

export default router;