import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// Import routes
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import questionRoutes from './routes/question.routes.js';
import testRoutes from './routes/test.routes.js';
import attemptsRoutes from './routes/attempt.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import studentDashboardRoutes from './routes/studentDashboard.routes.js';
import adminDashboardRoutes from  './routes/adminDashboard.routes.js';
import testAttendanceRoutes from './routes/testAttendance.routes.js';

// Initialize Express app
const app = express();

const isProduction = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const jsonLimit = process.env.JSON_BODY_LIMIT || '200kb';
const defaultWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const defaultMax = Number(process.env.RATE_LIMIT_MAX || 400);
const attemptsSubmitMax = Number(process.env.ATTEMPT_SUBMIT_RATE_LIMIT_MAX || 120);

// MIDDLEWARES

// Minimal request logging for launch monitoring (skip health checks)
app.use((req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });
  return next();
});

// Parse incoming JSON requests
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// Parse incoming cookies
app.use(cookieParser());

// Basic security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Configure CORS (Cross-Origin Resource Sharing)
// This  allows  frontend to communicate with  backend securely
app.use(
  cors({
    origin: clientUrl, // React/Vite frontend URL
    credentials: true, // Crucial for sending/receiving HTTP-only cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: defaultMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in a few minutes.',
  },
});
app.use('/api', apiLimiter);

// Stricter limiter for attempt submissions
const submitLimiter = rateLimit({
  windowMs: defaultWindowMs,
  max: attemptsSubmitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many test submissions in a short time. Please retry shortly.',
  },
});
app.use('/api/attempts/submit', submitLimiter);


// ROUTES

// Basic test route to check if the server is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to R Art Temple LMS API!' });
});

// Health endpoint for uptime/monitoring probes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
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

//api for student analytics 
app.use('/api/analytics', analyticsRoutes)

//api for student dashboard 
app.use('/api/student/dashboard', studentDashboardRoutes)

//api for admin dashboard 
app.use('/api/admin/dashboard', adminDashboardRoutes)

//api for admin to seen info about test attendancea
app.use('/api/admin/tests', testAttendanceRoutes )

// Not-found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Central error handler (do not leak internals in production)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isProduction ? {} : { error: err.stack }),
  });
});

export default app;