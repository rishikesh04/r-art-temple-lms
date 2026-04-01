import express from 'express';
import {
  submitTest,
  getMyAttempts,
  getMyAttemptById,
  getAllAttempts,
} from '../controllers/attempt.controller.js';
import { protect, isAdmin,  } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Student-only routes(for now admin can also access this routes )
router.post('/submit/:testId', protect,  submitTest);
router.get('/my-attempts', protect,  getMyAttempts);
router.get('/my-attempts/:id', protect,  getMyAttemptById);

// Admin-only route
router.get('/', protect, isAdmin, getAllAttempts);

export default router;