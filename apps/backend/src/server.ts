import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Create Express app
const app = express();

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(rateLimiter);

// Request logging
// Import the escape function from a sanitization library (e.g., lodash)
// Lodash provides utility functions for string manipulation and sanitization
const { escape } = require('lodash');

app.use((req, res, next) => {
  logger.info(`${escape(req.method)} ${escape(req.path)} - ${escape(req.ip)}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${escape(socket.id)}`);

  socket.on('join-document', (documentId: string) => {
    socket.join(`document:${documentId}`);
    logger.info(`User ${escape(socket.id)} joined document ${escape(documentId)}`);
  });

  socket.on('leave-document', (documentId: string) => {
    socket.leave(`document:${documentId}`);
    logger.info(`User ${escape(socket.id)} left document ${escape(documentId)}`);
  });

  socket.on('document-change', (data) => {
    socket.to(`document:${data.documentId}`).emit('document-update', data);
  });

  socket.on('cursor-position', (data) => {
    socket.to(`document:${data.documentId}`).emit('cursor-update', {
      userId: data.userId,
      position: data.position,
      socketId: socket.id
    });
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${escape(socket.id)}`);
  });
});

// 404 handler
app.use('*', (req, res) => {
  // Sanitize the originalUrl to prevent XSS
  const sanitizedUrl = escape(req.originalUrl);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${sanitizedUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default server;
