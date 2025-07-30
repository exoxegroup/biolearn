import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { submitPretest } from '../controllers/quizController';

const router = express.Router();

router.post('/pretest', protect, submitPretest);

export default router;