import express from 'express';
import { getTestLeaderboard } from '../controllers/leaderboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/leaderboard/test/:testId
router.get('/test/:testId', protect, getTestLeaderboard);

export default router;