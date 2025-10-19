import { Router, Request, Response } from 'express';

import { asyncHandler } from '@/core/middleware/errorHandler';
import { getMetrics, getRegistry } from '@/core/middleware/metrics';
import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';

const router = Router();

/**
 * Prometheus metrics endpoint
 * Returns metrics in Prometheus format
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (!config.monitoring.metrics.enabled) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Metrics collection is disabled',
      });
    }

    try {
      const metrics = await getMetrics();

      res.set('Content-Type', getRegistry().contentType);
      res.send(metrics);
    } catch (error) {
      logger.error('Failed to retrieve metrics:', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve metrics',
      });
    }
  })
);

/**
 * Metrics health endpoint
 */
router.get(
  '/health',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const registry = getRegistry();
      const metricNames = registry.getMetricsAsArray().map((metric) => metric.name);

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        enabled: config.monitoring.metrics.enabled,
        metricsCount: metricNames.length,
        metrics: metricNames,
      });
    } catch (error) {
      logger.error('Metrics health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

export { router as metricsRoutes };
