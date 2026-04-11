import express from 'express';
import rateLimit from 'express-rate-limit';
import { signupUser, loginUser, logoutUser, getCurrentUser } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { loginSchema, signupSchema } from '../validators/auth.validators.js';

const router = express.Router();

// Only limit login/signup — not /me or /logout (those share /api/auth and were burning the budget on refreshes/HMR).
const authWindowMs = Number(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000
);
const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX || 25);
const authAttemptLimiter = rateLimit({
  windowMs: authWindowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait and try again.',
  },
});

// @route   POST /api/auth/signup
// @desc    Register a new student
// @access  Public
router.post('/signup', authAttemptLimiter, validateBody(signupSchema), signupUser);

// @route   POST /api/auth/login
// @desc    Login user (Student or Admin)
// @access  Public
router.post('/login', authAttemptLimiter, validateBody(loginSchema), loginUser);

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookie
// @access  Public (or Private depending on frontend, safe to call anytime)
router.post('/logout', logoutUser);

// @route   GET /api/auth/me
// @desc    Get currently logged-in user details
// @access  Private (Requires valid JWT cookie)
router.get('/me', protect, getCurrentUser);

export default router;