const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware to protect routes and verify the logged-in user
const protect = async (req, res, next) => {
  let token;

  // Read the token from the "token" cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token is found, the user is not logged in
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID embedded in the token and exclude the password field
    const user = await User.findById(decoded.userId).select('-password');

    // If user is deleted but token still exists
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    // Attach the user object to the request so the next functions can use it
    req.user = user;
    next();
  } catch (error) {
    // If the token is invalid or expired
    return res.status(401).json({ message: 'Not authorized, token failed or expired' });
  }
};

// Middleware to allow access only to Admin users
const isAdmin = (req, res, next) => {
  // Check if a user is attached to the request (from the protect middleware) and if they are an admin
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin resources only.' });
  }
};

module.exports = {
  protect,
  isAdmin,
};