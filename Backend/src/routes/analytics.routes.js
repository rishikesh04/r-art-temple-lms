import express from 'express';
import { getStudentOverview } from '../controllers/analytics.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route: GET /api/analytics/me/overview
// Protect middleware ensures req.user exists. 
// Controller logic will ensure user is a student and approved.
router.get('/me/overview', protect, getStudentOverview);

export default router;