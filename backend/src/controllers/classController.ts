import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate unique code
async function generateUniqueCode(): Promise<string> {
  let code: string;
  let existing;
  do {
    code = uuidv4().slice(0, 8).toUpperCase();
    existing = await prisma.class.findUnique({ where: { classCode: code } });
  } while (existing);
  return code;
}

/**
 * @route   POST /api/classes
 * @desc    Create a new class (Teacher only)
 * @access  Private
 */
export const createClass = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can create classes' });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Class name is required' });
  }

  try {
    const classCode = await generateUniqueCode();
    const newClass = await prisma.class.create({
      data: {
        name,
        classCode,
        teacherId: req.user.id,
      },
    });
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/classes
 * @desc    Get teacher's classes
 * @access  Private
 */
export const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can view their classes' });
  }

  try {
    const classes = await prisma.class.findMany({
      where: { teacherId: req.user.id },
    });
    res.status(200).json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/classes/:id
 * @desc    Update a class (Teacher only, own classes)
 * @access  Private
 */
export const updateClass = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can update classes' });
  }

  const { id } = req.params;
  const { name } = req.body;

  try {
    const classToUpdate = await prisma.class.findUnique({ where: { id } });
    if (!classToUpdate) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (classToUpdate.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own classes' });
    }

    const updateData: { name?: string } = {};
    if (name !== undefined) updateData.name = name;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/classes/:id
 * @desc    Delete a class (Teacher only, own classes)
 * @access  Private
 */
export const deleteClass = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can delete classes' });
  }

  const { id } = req.params;

  try {
    const classToDelete = await prisma.class.findUnique({ where: { id } });
    if (!classToDelete) {
      return res.status(404).json({ message: 'Class not found' });
    }
    if (classToDelete.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own classes' });
    }

    await prisma.class.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};