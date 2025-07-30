import { AuthRequest } from '../middleware/authMiddleware';
import { Request, Response } from 'express';
import prisma from '../prisma';

export const submitPretest = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({ message: 'Only students can submit pretests' });
  }

  const { classId, answers } = req.body; // answers: array of selected indices

  try {
    const classRoom = await prisma.class.findUnique({
      where: { id: classId },
      include: { pretest: { include: { questions: true } } },
    });

    if (!classRoom || !classRoom.pretest) {
      return res.status(404).json({ message: 'Pretest not found for this class' });
    }

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { classId_studentId: { classId, studentId: req.user.id } },
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'Not enrolled in this class' });
    }

    if (enrollment.pretestScore !== null) {
      return res.status(400).json({ message: 'Pretest already taken' });
    }

    const questions = classRoom.pretest.questions;
    let score = 0;
    answers.forEach((answer: number, index: number) => {
      if (answer === questions[index].correctAnswerIndex) {
        score += 1;
      }
    });
    const finalScore = (score / questions.length) * 100;

    await prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: { pretestScore: finalScore },
    });

    res.status(200).json({ message: 'Pretest submitted successfully', score: finalScore });
  } catch (error) {
    console.error('Submit pretest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};