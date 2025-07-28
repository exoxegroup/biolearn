import express from 'express';
import { createClass, getTeacherClasses, updateClass, deleteClass, getClassDetails } from '../controllers/classController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (Teacher)
router.post('/', protect, createClass);

// @route   GET /api/classes
// @desc    Get teacher's classes
// @access  Private (Teacher)
router.get('/', protect, getTeacherClasses);

// @route   PUT /api/classes/:id
// @desc    Update a class
// @access  Private (Teacher)
router.put('/:id', protect, updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete a class
// @access  Private (Teacher)
router.delete('/:id', protect, deleteClass);

// @route   GET /api/classes/:id
// @desc    Get class details
// @access  Private
router.get('/:id', protect, getClassDetails);

export default router;