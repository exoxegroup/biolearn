import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { protect as authMiddleware } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

interface AnalyticsResponse {
  totalStudents: number;
  detailedStudentScores: Array<{
    id: string;
    name: string;
    gender: string;
    pretestScore: number | null;
    posttestScore: number | null;
    scoreImprovement: number | null;
  }>;
  femalePerformance: {
    count: number;
    avgPretestScore: number | null;
    avgPosttestScore: number | null;
    avgImprovement: number | null;
  };
  malePerformance: {
    count: number;
    avgPretestScore: number | null;
    avgPosttestScore: number | null;
    avgImprovement: number | null;
  };
  overall: {
    avgPretestScore: number | null;
    avgPosttestScore: number | null;
    avgScoreImprovement: number | null;
  };
}

export const getClassAnalytics = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const userId = (req as any).user.id;

    // Verify the teacher owns this class
    const classData = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: userId,
      },
    });

    if (!classData) {
      return res.status(403).json({ error: 'Access denied or class not found' });
    }

    // Get all enrolled students with their scores
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId: classId,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            gender: true,
          },
        },
      },
    });

    // Calculate detailed scores and metrics
    const detailedStudentScores = enrollments.map(enrollment => {
      const pretestScore = enrollment.pretestScore;
      const posttestScore = enrollment.posttestScore;
      const scoreImprovement = (pretestScore !== null && posttestScore !== null) 
        ? posttestScore - pretestScore 
        : null;

      return {
        id: enrollment.student.id,
        name: enrollment.student.name,
        gender: enrollment.student.gender,
        pretestScore,
        posttestScore,
        scoreImprovement,
      };
    });

    // Calculate female performance metrics
    const femaleStudents = detailedStudentScores.filter(student => student.gender === 'FEMALE');
    const femalePretestScores = femaleStudents.map(s => s.pretestScore).filter(s => s !== null) as number[];
    const femalePosttestScores = femaleStudents.map(s => s.pretestScore).filter(s => s !== null) as number[];
    const femaleImprovements = femaleStudents.map(s => s.scoreImprovement).filter(s => s !== null) as number[];

    const femalePerformance = {
      count: femaleStudents.length,
      avgPretestScore: femalePretestScores.length > 0 ? femalePretestScores.reduce((a, b) => a + b, 0) / femalePretestScores.length : null,
      avgPosttestScore: femalePosttestScores.length > 0 ? femalePosttestScores.reduce((a, b) => a + b, 0) / femalePosttestScores.length : null,
      avgImprovement: femaleImprovements.length > 0 ? femaleImprovements.reduce((a, b) => a + b, 0) / femaleImprovements.length : null,
    };

    // Calculate male performance metrics
    const maleStudents = detailedStudentScores.filter(student => student.gender === 'MALE');
    const malePretestScores = maleStudents.map(s => s.pretestScore).filter(s => s !== null) as number[];
    const malePosttestScores = maleStudents.map(s => s.posttestScore).filter(s => s !== null) as number[];
    const maleImprovements = maleStudents.map(s => s.scoreImprovement).filter(s => s !== null) as number[];

    const malePerformance = {
      count: maleStudents.length,
      avgPretestScore: malePretestScores.length > 0 ? malePretestScores.reduce((a, b) => a + b, 0) / malePretestScores.length : null,
      avgPosttestScore: malePosttestScores.length > 0 ? malePosttestScores.reduce((a, b) => a + b, 0) / malePosttestScores.length : null,
      avgImprovement: maleImprovements.length > 0 ? maleImprovements.reduce((a, b) => a + b, 0) / maleImprovements.length : null,
    };

    // Calculate overall metrics
    const allPretestScores = detailedStudentScores.map(s => s.pretestScore).filter(s => s !== null) as number[];
    const allPosttestScores = detailedStudentScores.map(s => s.posttestScore).filter(s => s !== null) as number[];
    const allImprovements = detailedStudentScores.map(s => s.scoreImprovement).filter(s => s !== null) as number[];

    const overall = {
      avgPretestScore: allPretestScores.length > 0 ? allPretestScores.reduce((a, b) => a + b, 0) / allPretestScores.length : null,
      avgPosttestScore: allPosttestScores.length > 0 ? allPosttestScores.reduce((a, b) => a + b, 0) / allPosttestScores.length : null,
      avgScoreImprovement: allImprovements.length > 0 ? allImprovements.reduce((a, b) => a + b, 0) / allImprovements.length : null,
    };

    const analytics: AnalyticsResponse = {
      totalStudents: detailedStudentScores.length,
      detailedStudentScores,
      femalePerformance,
      malePerformance,
      overall,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

// Helper function to wrap routes with authentication
export const analyticsRoutes = {
  getClassAnalytics: [authMiddleware, getClassAnalytics],
};