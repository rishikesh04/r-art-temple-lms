import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// Import routes
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/question.routes.js';
import testRoutes from './routes/test.routes.js';
import attemptsRoutes from './routes/attempt.routes.js'
import leaderboardRoutes from './routes/leaderboard.routes.js'

// Initialize Express app
const app = express();


// MIDDLEWARES

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming cookies
app.use(cookieParser());

// Configure CORS (Cross-Origin Resource Sharing)
// This  allows  frontend to communicate with  backend securely
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // React/Vite frontend URL
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

//create test api
app.use('/api/tests', testRoutes)

//api for submitting test
app.use('/api/attempts', attemptsRoutes)

//api for getting particular test leaderboard
app.use('/api/leaderboard', leaderboardRoutes)


export default app;