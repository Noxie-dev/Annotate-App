import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import stringify = require('json-stringify-safe');

// Create Redis client if available
let redisClient: Redis | undefined;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info('Connected to Redis for rate limiting');
  }
} catch (error) {
  logger.warn('Failed to connect to Redis, using memory-based rate limiting');
}

// Rate limiter configuration
const rateLimiterConfig = {
  keyPrefix: process.env.RATE_LIMIT_KEY_PREFIX || 'file_chat_rl',
  points: Number(process.env.RATE_LIMIT_POINTS) || 100, // Number of requests
  duration: Number(process.env.RATE_LIMIT_DURATION) || 60, // Per 60 seconds
  blockDuration: Number(process.env.RATE_LIMIT_BLOCK_DURATION) || 60, // Block for 60 seconds if limit exceeded
};

// Create rate limiter instance
const rateLimiter = redisClient 
  ? new RateLimiterRedis({
      storeClient: redisClient,
      ...rateLimiterConfig
    })
  : new RateLimiterMemory(rateLimiterConfig);

// Stricter rate limiting for auth endpoints
const authRateLimiter = redisClient
  ? new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: process.env.AUTH_RATE_LIMIT_KEY_PREFIX || 'file_chat_auth_rl',
      points: Number(process.env.AUTH_RATE_LIMIT_POINTS) || 5, // 5 requests
      duration: Number(process.env.AUTH_RATE_LIMIT_DURATION) || 60, // Per 60 seconds
      blockDuration: Number(process.env.AUTH_RATE_LIMIT_BLOCK_DURATION) || 300, // Block for 5 minutes
    })
  : new RateLimiterMemory({
      keyPrefix: process.env.AUTH_RATE_LIMIT_KEY_PREFIX || 'file_chat_auth_rl',
      points: Number(process.env.AUTH_RATE_LIMIT_POINTS) || 5,
      duration: Number(process.env.AUTH_RATE_LIMIT_DURATION) || 60,
      blockDuration: Number(process.env.AUTH_RATE_LIMIT_BLOCK_DURATION) || 300,
    });

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // JSON.stringify is used to safely encode potentially malicious input before logging
  try {
    const key = req.ip || 'unknown';
    
    // Use stricter limits for auth endpoints
    const limiter = req.path.startsWith('/api/auth') ? authRateLimiter : rateLimiter;
    
    await limiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${stringify(req.ip)}`, {
      path: req.path,
      method: req.method,
      retryAfter: secs
    });
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: secs,
      timestamp: new Date().toISOString()
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };

