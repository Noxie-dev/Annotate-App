import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Import csrf from 'csurf' for CSRF protection
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

// GET /api/documents
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Get documents endpoint - Coming soon!',
    documents: [],
    timestamp: new Date().toISOString()
  });
}));

// POST /api/documents
router.post('/', csrfProtection, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Create document endpoint - Coming soon!',
    timestamp: new Date().toISOString()
  });
}));

// GET /api/documents/:id
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: `Get document ${req.params.id} endpoint - Coming soon!`,
    timestamp: new Date().toISOString()
  });
}));

// PUT /api/documents/:id
// This middleware adds CSRF protection to the route
router.put('/:id', csrfProtection, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: `Update document ${req.params.id} endpoint - Coming soon!`,
    timestamp: new Date().toISOString()
  });
}));

// DELETE /api/documents/:id
router.delete('/:id', csrfProtection, asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: `Delete document ${req.params.id} endpoint - Coming soon!`,
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
