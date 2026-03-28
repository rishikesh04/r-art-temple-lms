const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// Import routes
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const questionRoutes = require('./routes/question.routes')


// Initialize Express app
const app = express();


// MIDDLEWARES

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming cookies (needed for JWT auth)
app.use(cookieParser());

// Configure CORS (Cross-Origin Resource Sharing)
// This allows your frontend to communicate with your backend securely
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Your React/Vite frontend URL
    credentials: true, // Crucial for sending/receiving HTTP-only cookies
  })
);


// ROUTES

// Basic test route to check if the server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to R Art Temple LMS API!' });
});

// Mount the authentication routes
app.use('/api/auth', authRoutes);

//routes for admin only
app.use('/api/admin', adminRoutes);

//routes for questions
app.use('/api/questions/',questionRoutes)

// Export the configured app so it can be used in server.js
module.exports = app;