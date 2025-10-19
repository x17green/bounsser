import { Router } from 'express';

const router = Router();

// Placeholder ingest routes
// TODO: Implement webhook and stream ingestion routes

router.get('/', (req, res) => {
  res.json({ message: 'Ingest routes - Coming soon' });
});

export { router as ingestRoutes };
