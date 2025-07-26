
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

const app = express();

app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:5173'
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
import classRoutes from './routes/classRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
import materialRoutes from './routes/materialRoutes';
app.use('/api/materials', materialRoutes);


const PORT = process.env.BACKEND_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});