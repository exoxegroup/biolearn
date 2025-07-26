import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

/**
 * @route   POST /api/materials/:classId
 * @desc    Upload material to a class (Teacher only)
 * @access  Private
 */
export const uploadMaterial = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can upload materials' });
  }

  const { classId } = req.params;
  const { title, type, youtubeUrl } = req.body;
  const file = req.file;

  try {
    const classRoom = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRoom || classRoom.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only upload to your own classes' });
    }

    let url: string;
    let materialType: string;

    if (type === 'youtube') {
      if (!youtubeUrl) return res.status(400).json({ message: 'YouTube URL required' });
      // Parse YouTube URL to get video ID
      const videoIdMatch = youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (!videoIdMatch) return res.status(400).json({ message: 'Invalid YouTube URL' });
      const videoId = videoIdMatch[1];
      url = `https://www.youtube.com/embed/${videoId}`;
      materialType = 'youtube';
    } else if (file) {
      url = `/uploads/${file.filename}`;
      materialType = path.extname(file.originalname).slice(1);
    } else {
      return res.status(400).json({ message: 'File or YouTube URL required' });
    }

    const material = await prisma.material.create({
      data: {
        title: title || 'Untitled',
        type: materialType as any,
        url,
        classId,
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/materials/:classId
 * @desc    Get materials for a class
 * @access  Private
 */
export const getMaterials = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const { classId } = req.params;

  try {
    // Check if user is enrolled or teacher
    const classRoom = await prisma.class.findUnique({
      where: { id: classId },
      include: { enrollments: { where: { studentId: req.user.id } } }
    });

    if (!classRoom || (classRoom.teacherId !== req.user.id && classRoom.enrollments.length === 0)) {
      return res.status(403).json({ message: 'Not authorized to view materials' });
    }

    const materials = await prisma.material.findMany({ where: { classId } });
    res.status(200).json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};