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
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Update user profile endpoint - Coming soon!',
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
