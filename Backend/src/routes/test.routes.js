import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
} from '../controllers/test.controller.js';


import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import {
  createTestSchema,
  mongoIdParamSchema,
  updateTestSchema,
} from '../validators/test.validators.js';

const router = express.Router();

// Admin-only test management routes (Creation, Updates, Deletions)
router.post('/', protect, isAdmin, validateBody(createTestSchema), createTest);
router.patch('/:id', protect, isAdmin, validateParams(mongoIdParamSchema), validateBody(updateTestSchema), updateTest);
router.delete('/:id', protect, isAdmin, validateParams(mongoIdParamSchema), deleteTest);

// Protected routes for viewing tests (Accessible by Admin and approved Students)
router.get('/', protect, getAllTests);
router.get('/:id', protect, validateParams(mongoIdParamSchema), getTestById);

export default router;