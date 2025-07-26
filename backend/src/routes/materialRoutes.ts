import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadMaterial, getMaterials, upload } from '../controllers/materialController';

const router = express.Router();

// @route   POST /api/materials/:classId
// @desc    Upload material to a class (Teacher only)
// @access  Private
router.post('/:classId', protect, upload.single('file'), uploadMaterial);

// @route   GET /api/materials/:classId
// @desc    Get materials for a class
// @access  Private
router.get('/:classId', protect, getMaterials);

export default router;