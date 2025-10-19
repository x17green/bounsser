import { Router, Request, Response } from 'express';

import { asyncHandler } from '@/core/middleware/errorHandler';
import { prisma } from '@/db/index';
import { redisHealthCheck } from '@/modules/shared/utils/redis';
import { queueHealthCheck } from '@/workers/index';
import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';

const router = Router();

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      error?: string;
    };
    queues: {
      status: 'healthy' | 'unhealthy';
      error?: string;
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * Basic health check endpoint
 * Returns 200 if service is running
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const healthResult = await performHealthCheck();

    const statusCode =
      healthResult.status === 'healthy' ? 200 : healthResult.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthResult);
  })
);

/**
 * Detailed health check endpoint
 */
router.get(
  '/detailed',
  asyncHandler(async (req: Request, res: Response) => {
    const healthResult = await performDetailedHealthCheck();

    const statusCode =
      healthResult.status === 'healthy' ? 200 : healthResult.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthResult);
  })
);

/**
 * Liveness probe endpoint (for Kubernetes)
 * Returns 200 if the application is alive
 */
router.get(
  '/live',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
);

/**
 * Readiness probe endpoint (for Kubernetes)
 * Returns 200 if the application is ready to serve traffic
 */
router.get(
  '/ready',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Check critical dependencies
      const [dbHealth, redisHealth, queueHealth] = await Promise.all([
        checkDatabaseHealth(),
        redisHealthCheck(),
        queueHealthCheck(),
      ]);

      const isReady = dbHealth.healthy && redisHealth.healthy && queueHealth.healthy;

      if (!isReady) {
        return res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          services: {
            database: { ...dbHealth, status: dbHealth.healthy ? 'healthy' : 'unhealthy' },
            redis: { ...redisHealth, status: redisHealth.healthy ? 'healthy' : 'unhealthy' },
            queues: { ...queueHealth, status: queueHealth.healthy ? 'healthy' : 'unhealthy' },
          },
        });
      }

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: { ...dbHealth, status: dbHealth.healthy ? 'healthy' : 'unhealthy' },
          redis: { ...redisHealth, status: redisHealth.healthy ? 'healthy' : 'unhealthy' },
          queues: { ...queueHealth, status: queueHealth.healthy ? 'healthy' : 'unhealthy' },
        },
      });
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

/**
 * Database-specific health check
 */
router.get(
  '/db',
  asyncHandler(async (req: Request, res: Response) => {
    const dbHealth = await checkDatabaseHealth();
    const statusCode = dbHealth.healthy ? 200 : 503;

    res.status(statusCode).json(dbHealth);
  })
);

/**
 * Redis-specific health check
 */
router.get(
  '/redis',
  asyncHandler(async (req: Request, res: Response) => {
    const redisHealth = await redisHealthCheck();
    const statusCode = redisHealth.healthy ? 200 : 503;

    res.status(statusCode).json(redisHealth);
  })
);

/**
 * Queue-specific health check
 */
router.get(
  '/queues',
  asyncHandler(async (req: Request, res: Response) => {
    const queueHealth = await queueHealthCheck();
    const statusCode = queueHealth.healthy ? 200 : 503;

    res.status(statusCode).json(queueHealth);
  })
);

/**
 * Perform basic health check
 */
async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const [dbHealth, redisHealth, queueHealth] = await Promise.all([
      checkDatabaseHealth(),
      redisHealthCheck(),
      queueHealthCheck(),
    ]);

    const memoryUsage = process.memoryUsage();
    const memoryPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Determine overall status
    if (!dbHealth.healthy || !redisHealth.healthy) {
      overallStatus = 'unhealthy';
    } else if (!queueHealth.healthy || memoryPercentage > 90) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: config.app.version,
      environment: config.app.env,
      services: {
        database: {
          ...dbHealth,
          status: dbHealth.healthy ? ('healthy' as const) : ('unhealthy' as const),
        },
        redis: {
          ...redisHealth,
          status: redisHealth.healthy ? ('healthy' as const) : ('unhealthy' as const),
        },
        queues: {
          ...queueHealth,
          status: queueHealth.healthy ? ('healthy' as const) : ('unhealthy' as const),
        },
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
    };
  } catch (error) {
    logger.error('Health check failed:', error);

    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: config.app.version,
      environment: config.app.env,
      services: {
        database: { status: 'unhealthy', error: 'Health check failed' },
        redis: { status: 'unhealthy', error: 'Health check failed' },
        queues: { status: 'unhealthy', error: 'Health check failed' },
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
      },
    };
  }
}

/**
 * Perform detailed health check with additional metrics
 */
async function performDetailedHealthCheck(): Promise<any> {
  const basicHealth = await performHealthCheck();

  try {
    // Get additional system information
    const dbInfo = await prisma.getDatabaseInfo();
    const tableStats = await prisma.getTableStats();

    return {
      ...basicHealth,
      details: {
        database: {
          ...basicHealth.services.database,
          info: dbInfo,
          tables: tableStats,
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          ppid: process.ppid,
        },
        config: {
          nodeEnv: config.app.env,
          port: config.app.port,
          logLevel: config.monitoring.logging.level,
          metricsEnabled: config.monitoring.metrics.enabled,
        },
      },
    };
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    return {
      ...basicHealth,
      details: {
        error: error instanceof Error ? error.message : 'Failed to get detailed information',
      },
    };
  }
}

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
  healthy: boolean;
}> {
  const startTime = Date.now();

  try {
    const isHealthy = await prisma.healthCheck();
    const latency = Date.now() - startTime;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      healthy: isHealthy,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    return {
      status: 'unhealthy',
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Database health check failed',
    };
  }
}

export { router as healthRoutes };
