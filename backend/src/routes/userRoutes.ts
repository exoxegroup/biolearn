
import express from 'express';
import { updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user's profile (phone, address)
// @access  Private (requires authentication)
router.put('/profile', protect, updateProfile);

export default router;
