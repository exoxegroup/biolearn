import express from 'express';
import { getAIResponse } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// POST /api/ai/ask - Get AI response for a prompt
router.post('/ask', getAIResponse);

export default router;