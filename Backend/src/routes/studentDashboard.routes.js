import express from 'express';
import { getStudentDashboard } from '../controllers/studentDashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route: GET /api/student/dashboard
// The 'protect' middleware ensures req.user exists and the token is valid.
// The controller handles the role-based restrictions.
router.get('/', protect, getStudentDashboard);

export default router;