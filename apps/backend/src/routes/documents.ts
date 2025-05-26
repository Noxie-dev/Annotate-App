import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/documents
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: 'Get documents endpoint - Coming soon!',
    documents: [],
    timestamp: new Date().toISOString()
  });
}));

// POST /api/documents
router.post('/', asyncHandler(async (req: Request, res: Response) => {
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
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: `Update document ${req.params.id} endpoint - Coming soon!`,
    timestamp: new Date().toISOString()
  });
}));

// DELETE /api/documents/:id
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    message: `Delete document ${req.params.id} endpoint - Coming soon!`,
    timestamp: new Date().toISOString()
  });
}));

module.exports = router;
