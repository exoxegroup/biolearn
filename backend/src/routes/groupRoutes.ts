import express from 'express';
import { assignGroups, getGroupAssignments, getGroupNotes, updateGroupNotes } from '../controllers/groupController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Assign students to groups (teacher only)
router.put('/classes/:classId/groups', protect, assignGroups);

// Get group assignments (teacher and enrolled students)
router.get('/classes/:classId/groups', protect, getGroupAssignments);

// Get group notes
router.get('/groups/:classId/:groupId/notes', protect, getGroupNotes);

// Update group notes
router.put('/groups/:classId/:groupId/notes', protect, updateGroupNotes);

export default router;