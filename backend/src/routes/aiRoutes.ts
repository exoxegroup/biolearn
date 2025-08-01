import express from 'express';
import { getAIResponse } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Enable JWT authentication for AI endpoint
router.use(protect);

// POST /api/ai/ask - Get AI response for a prompt
router.post('/ask', getAIResponse);

export default router;