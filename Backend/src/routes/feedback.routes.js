import express from 'express';
import { submitFeedback } from '../controllers/feedback.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limit: Only 5 feedback reports per 15 minutes per IP
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many feedback reports submitted. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/feedback
router.post('/', protect, feedbackLimiter, submitFeedback);

export default router;
