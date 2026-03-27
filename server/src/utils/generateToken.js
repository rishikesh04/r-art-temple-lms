const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // Generate a new JWT token with the user's ID
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });

  // Set the token in an HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side scripts from accessing the cookie
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production (HTTPS)
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days (in milliseconds)
  });

  return token;
};

module.exports = generateToken;