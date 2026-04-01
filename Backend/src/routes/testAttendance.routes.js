import express from 'express';
import { getTestAttendance } from '../controllers/testAttendance.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:testId/attendance', protect, isAdmin, getTestAttendance);

export default router;