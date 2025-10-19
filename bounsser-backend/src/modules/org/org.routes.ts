import { Router } from 'express';

const router = Router();

// Placeholder organization routes
// TODO: Implement organization management routes

router.get('/', (req, res) => {
  res.json({ message: 'Organization routes - Coming soon' });
});

export { router as orgRoutes };
