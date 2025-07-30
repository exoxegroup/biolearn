import express from 'express';
import { assignGroups, getGroupAssignments } from '../controllers/groupController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Assign students to groups (teacher only)
router.put('/classes/:classId/groups', protect, assignGroups);

// Get group assignments (teacher and enrolled students)
router.get('/classes/:classId/groups', protect, getGroupAssignments);

export default router;