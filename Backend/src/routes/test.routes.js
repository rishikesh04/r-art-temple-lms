import express from 'express';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
} from '../controllers/test.controller.js';


import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin-only test management routes (Creation, Updates, Deletions)
router.post('/', protect, isAdmin, createTest);
router.patch('/:id', protect, isAdmin, updateTest);
router.delete('/:id', protect, isAdmin, deleteTest);

// Protected routes for viewing tests (Accessible by Admin and approved Students)
router.get('/', protect, getAllTests);
router.get('/:id', protect, getTestById);

export default router;