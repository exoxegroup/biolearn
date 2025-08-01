import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const assignGroups = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { groupAssignments } = req.body; // Array of { studentId: string, groupNumber: number }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Verify the teacher owns this class
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: req.user.id,
      },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have permission to manage this class',
      });
    }

    // Validate group assignments
    if (!Array.isArray(groupAssignments)) {
      return res.status(400).json({
        success: false,
        message: 'groupAssignments must be an array',
      });
    }

    // Verify all students are enrolled in this class
    const studentIds = groupAssignments.map((assignment: any) => assignment.studentId);
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId,
        studentId: {
          in: studentIds,
        },
      },
    });

    if (enrollments.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some students are not enrolled in this class',
      });
    }

    // Update group assignments for each student
    const updatePromises = groupAssignments.map(async (assignment: { studentId: string; groupNumber: number }) => {
      return prisma.studentEnrollment.update({
        where: {
          classId_studentId: {
            classId,
            studentId: assignment.studentId,
          },
        },
        data: {
          groupNumber: assignment.groupNumber,
        },
      });
    });

    await Promise.all(updatePromises);

    // Fetch updated enrollments with student details
    const updatedEnrollments = await prisma.studentEnrollment.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
          },
        },
      },
      orderBy: {
        groupNumber: 'asc',
      },
    });

    res.json({
      success: true,
      message: 'Group assignments updated successfully',
      enrollments: updatedEnrollments,
    });
  } catch (error) {
    console.error('Error assigning groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign groups',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get group assignments for a class
export const getGroupAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Verify the teacher owns this class or student is enrolled
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        OR: [
          { teacherId: req.user.id },
          {
            enrollments: {
              some: {
                studentId: req.user.id,
              },
            },
          },
        ],
      },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have access',
      });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            gender: true,
          },
        },
      },
      orderBy: {
        groupNumber: 'asc',
      },
    });

    // Group students by group number
    const groups: { [key: number]: any[] } = {};
    enrollments.forEach((enrollment) => {
      const groupNum = enrollment.groupNumber || 0;
      if (!groups[groupNum]) {
        groups[groupNum] = [];
      }
      groups[groupNum].push({
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        gender: enrollment.student.gender,
        groupNumber: enrollment.groupNumber,
      });
    });

    res.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Error fetching group assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group assignments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get group notes
export const getGroupNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, groupId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Verify the teacher owns this class or student is enrolled and in the group
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        OR: [
          { teacherId: req.user.id },
          {
            enrollments: {
              some: {
                studentId: req.user.id,
                groupNumber: parseInt(groupId),
              },
            },
          },
        ],
      },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have access to this group',
      });
    }

    // Find or create group notes
    let groupNotes = await prisma.groupNote.findUnique({
      where: {
        classId_groupId: {
          classId,
          groupId: parseInt(groupId),
        },
      },
    });

    // Create if doesn't exist
    if (!groupNotes) {
      groupNotes = await prisma.groupNote.create({
        data: {
          classId,
          groupId: parseInt(groupId),
          content: '',
        },
      });
    }

    res.json({
      success: true,
      content: groupNotes.content || '',
    });
  } catch (error) {
    console.error('Error fetching group notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group notes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update group notes
export const updateGroupNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, groupId } = req.params;
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Verify the teacher owns this class or student is enrolled and in the group
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        OR: [
          { teacherId: req.user.id },
          {
            enrollments: {
              some: {
                studentId: req.user.id,
                groupNumber: parseInt(groupId),
              },
            },
          },
        ],
      },
    });

    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you do not have access to this group',
      });
    }

    // Update or create group notes
    const groupNotes = await prisma.groupNote.upsert({
      where: {
        classId_groupId: {
          classId,
          groupId: parseInt(groupId),
        },
      },
      update: {
        content: content || '',
      },
      create: {
        classId,
        groupId: parseInt(groupId),
        content: content || '',
      },
    });

    res.json({
      success: true,
      message: 'Group notes updated successfully',
      content: groupNotes.content,
    });
  } catch (error) {
    console.error('Error updating group notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group notes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};