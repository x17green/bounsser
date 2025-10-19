import { Router } from 'express';

const router = Router();

// Placeholder monitoring routes
// TODO: Implement system monitoring and analytics routes

router.get('/', (req, res) => {
  res.json({ message: 'Monitoring routes - Coming soon' });
});

export { router as monitoringRoutes };
