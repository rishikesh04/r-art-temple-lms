import express from 'express';
import { getStudentOverview, getTopicPerformance } from '../controllers/analytics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me/overview', protect, getStudentOverview);

// Route: GET /api/analytics/topics
router.get('/topics', protect, getTopicPerformance);

export default router;