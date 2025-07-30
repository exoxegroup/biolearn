import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * @route   POST /api/enrollments
 * @desc    Enroll student in a class using code
 * @access  Private
 */
export const enrollInClass = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Only students can enroll' });
  }

  console.log('Received enrollment request body:', req.body);

  const { classCode } = req.body;

  if (!classCode) {
    return res.status(400).json({ message: 'Class code required' });
  }

  try {
    const classRoom = await prisma.class.findUnique({ where: { classCode: classCode } });
    if (!classRoom) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const existingEnrollment = await prisma.studentEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: classRoom.id,
          studentId: req.user.id
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        classId: classRoom.id,
        studentId: req.user.id
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/enrollments/:classId
 * @desc    Get enrollments for a class (Teacher only)
 * @access  Private
 */
export const getEnrollments = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can view enrollments' });
  }

  const { classId } = req.params;

  try {
    const classRoom = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRoom || classRoom.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classId },
      include: { student: { select: { id: true, name: true, email: true } } }
    });

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentClasses = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Only students can view their enrolled classes' });
  }

  try {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { studentId: req.user.id },
      include: {
        class: {
          include: {
            teacher: true,
            enrollments: true
          }
        }
      }
    });

    const classes = enrollments.map(e => ({
      id: e.class.id,
      name: e.class.name,
      classCode: e.class.classCode,
      teacherName: e.class.teacher.name,
      studentCount: e.class.enrollments.length
    }));

    res.status(200).json(classes);
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};