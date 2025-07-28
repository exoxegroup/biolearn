import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for memory storage (we'll stream to Cloudinary)
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx'];
    const allowedMimetypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'];
    const ext = path.extname(file.originalname).toLowerCase();
    const isValidExt = allowedExtensions.includes(ext);
    const isValidMime = allowedMimetypes.includes(file.mimetype);
    if (isValidExt && (isValidMime || (ext === '.pdf' && file.mimetype === 'application/octet-stream'))) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed. Check file extension and type.'));
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
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: uniqueName },
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'File upload failed' });
          }
          if (!result) {
            console.error('No result from Cloudinary upload');
            return res.status(500).json({ message: 'File upload failed' });
          }
          url = result.secure_url;
          materialType = path.extname(file.originalname).slice(1);

          const material = await prisma.material.create({
            data: {
              title: title || 'Untitled',
              type: materialType as any,
              url,
              classId,
            }
          });

          res.status(201).json(material);
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
      return; // Return here to wait for the upload to complete
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

/**
 * @route   DELETE /api/materials/:materialId
 * @desc    Delete a material from a class (Teacher only)
 * @access  Private
 */
export const deleteMaterial = async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Only teachers can delete materials' });
  }

  const { materialId } = req.params;

  try {
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const classRoom = await prisma.class.findUnique({ where: { id: material.classId } });
    if (!classRoom || classRoom.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete materials from your own classes' });
    }

    await prisma.material.delete({ where: { id: materialId } });
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};