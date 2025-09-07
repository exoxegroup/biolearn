import express from 'express';
import { analyticsRoutes } from '../controllers/analyticsController';

const router = express.Router();

// GET /api/analytics/class/:classId
router.get('/class/:classId', ...analyticsRoutes.getClassAnalytics);

export default router;