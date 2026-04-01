import express from 'express';
import { getAllStudents, getPendingStudents, approveStudent, rejectStudent } from '../controllers/admin.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(isAdmin);

// Get pending students
router.get('/students/pending', getPendingStudents);

// Get all students
router.get('/students', getAllStudents);

// Approve a student
router.patch('/students/:id/approve', approveStudent);

// Reject a student
router.patch('/students/:id/reject', rejectStudent);

export default router;