import express from 'express';
import { getAdminDashboard } from '../controllers/adminDashboard.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', protect, isAdmin, getAdminDashboard);

export default router;