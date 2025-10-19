import { Request, Response, NextFunction } from 'express';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';

export const maintenance = (req: Request, res: Response, next: NextFunction): void => {
  // Skip maintenance mode for health checks and essential endpoints
  const exemptPaths = [
    '/health',
    '/ready',
    '/live',
    '/metrics',
    '/api/v1/webhooks', // Allow webhooks to continue working
  ];

  const isExempt = exemptPaths.some((path) => req.path.startsWith(path));

  if (config.maintenance.mode && !isExempt) {
    logger.info('Request blocked due to maintenance mode', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
    });

    res.status(503).json({
      error: 'ServiceUnavailable',
      message: config.maintenance.message,
      status: 503,
      timestamp: new Date().toISOString(),
      path: req.path,
      requestId: req.requestId,
      maintenanceMode: true,
    });
    return;
  }

  next();
};
