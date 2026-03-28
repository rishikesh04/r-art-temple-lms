const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

// @desc    Register a new student
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password, classLevel } = req.body;

    // Check if a user with this email or phone no. already exists
    const userExists = await User.findOne({
       $or: [
         { email },
         { phone }
        ],
     });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or phone number already exists' });
    }
   

    // Create the new user
    // We strictly set role to 'student' and status to 'pending'
    const user = await User.create({
      name,
      email,
      phone,
      password,
      classLevel,
      role: 'student',
      status: 'pending',
    });

    // We do NOT generate a token or auto-login the user here.
    // They must wait for admin approval.
    res.status(201).json({
      message: 'Account created successfully. Please wait for admin approval before logging in.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Business Logic: Check if the user is a student and approved
    if (user.role === 'student' && user.status !== 'approved') {
      return res.status(403).json({
        message: `Your account status is currently '${user.status}'. You cannot log in until the admin approves your account.`,
      });
    }

    // Generate JWT token and set it in a cookie
    generateToken(res, user._id);

    // Return user info (excluding password)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        classLevel: user.classLevel,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  // Clear the cookie by setting an empty token and expiring it immediately
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    // req.user will be populated by the protect middleware
    if (req.user) {
      res.status(200).json({
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          classLevel: req.user.classLevel,
          status: req.user.status,
        },
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};