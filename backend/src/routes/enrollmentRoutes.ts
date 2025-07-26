import { Router } from 'express';
import { enrollInClass, getEnrollments } from '../controllers/enrollmentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, enrollInClass);
router.get('/:classId', protect, getEnrollments);

export default router;