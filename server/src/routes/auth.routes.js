const express = require('express');
const {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new student
// @access  Public
router.post('/signup', signupUser);

// @route   POST /api/auth/login
// @desc    Login user (Student or Admin)
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/logout
// @desc    Logout user and clear cookie
// @access  Public (or Private depending on frontend, safe to call anytime)
router.post('/logout', logoutUser);

// @route   GET /api/auth/me
// @desc    Get currently logged-in user details
// @access  Private (Requires valid JWT cookie)
router.get('/me', protect, getCurrentUser);

module.exports = router;