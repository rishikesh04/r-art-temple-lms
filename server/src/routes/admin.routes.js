const express = require('express');
const {
  getAllStudents,
  getPendingStudents,
  approveStudent,
  rejectStudent,
} = require('../controllers/admin.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

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

module.exports = router;