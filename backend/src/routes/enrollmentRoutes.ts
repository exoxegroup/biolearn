import { Router } from 'express';
import { enrollInClass, getEnrollments, getStudentClasses } from '../controllers/enrollmentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, enrollInClass);
router.get('/student', protect, getStudentClasses);
router.get('/:classId', protect, getEnrollments);


export default router;