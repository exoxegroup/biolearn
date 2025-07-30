import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { updateQuiz, getQuiz, getQuizWithAnswers, deleteQuiz, submitPretest, submitQuiz } from '../controllers/quizController';

const router = express.Router();

// Create or update quiz (teacher only)
router.put('/classes/:classId/quiz', authenticateToken, updateQuiz);

// Get quiz for students (without answers)
router.get('/classes/:classId/quiz', authenticateToken, getQuiz);

// Get quiz with answers (teacher only)
router.get('/classes/:classId/quiz/answers', authenticateToken, getQuizWithAnswers);

// Delete quiz (teacher only)
router.delete('/classes/:classId/quiz', authenticateToken, deleteQuiz);

// Submit pretest (existing)
router.post('/pretest', authenticateToken, submitPretest);

// Submit quiz (both pretest and posttest)
router.post('/classes/:classId/quiz/submit', authenticateToken, submitQuiz);

export default router;