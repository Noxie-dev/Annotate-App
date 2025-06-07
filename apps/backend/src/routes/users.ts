import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/users/profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Get user profile endpoint - Coming soon!',
    timestamp: new Date().toISOString()
  });
}));

// PUT /api/users/profile
// Import csrf from 'csurf' for CSRF protection
// This middleware adds CSRF protection to routes
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

router.put('/profile', csrfProtection, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Update user profile endpoint - Coming soon!',
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
