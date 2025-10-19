import { createServer } from 'http';
import type { Server as HttpServer } from 'http';

import { config } from './config';
import { appInstance } from './app';

import { logger } from '@/modules/shared/utils/logger';
import { prisma } from '@/db/index';
import { redisClient } from '@/modules/shared/utils/redis';
import { initializeQueues, closeQueues } from '@/workers/index';
import { metricsServer } from '@/modules/monitoring/metrics.server';

class Server {
  private httpServer?: HttpServer;
  private isShuttingDown = false;

  async start(): Promise<void> {
    try {
      // Validate configuration
      const configValidation = this.validateConfiguration();
      if (!configValidation.success) {
        logger.error('Configuration validation failed:', configValidation.error);
        process.exit(1);
      }

      // Connect to database
      await this.connectDatabase();

      // Connect to Redis
      await this.connectRedis();

      // Initialize message queues
      await this.initializeQueues();

      // Start metrics server if enabled
      if (config.monitoring.metrics.enabled) {
        await this.startMetricsServer();
      }

      // Start HTTP server
      await this.startHttpServer();

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();

      logger.info(`🚀 ${config.app.name} server started successfully!`);
      logger.info(`📍 Environment: ${config.app.env}`);
      logger.info(`🌐 Server running on port ${config.app.port}`);
      logger.info(`📊 Metrics server running on port ${config.monitoring.metrics.port}`);
      logger.info(`🔗 Health check: ${config.app.url}${config.monitoring.healthCheck.path}`);

      if (config.development.enableSwagger && config.app.isDevelopment) {
        logger.info(`📚 API Documentation: ${config.app.url}/api-docs`);
      }
    } catch (error) {
      logger.error('Failed to start server:', error);
      await this.shutdown(1);
    }
  }

  private validateConfiguration(): { success: boolean; error?: any } {
    try {
      // Basic validation checks
      if (!config.database.url) {
        throw new Error('DATABASE_URL is required');
      }

      if (!config.redis.url) {
        throw new Error('REDIS_URL is required');
      }

      if (!config.twitter.apiKey || !config.twitter.apiSecret) {
        throw new Error('Twitter API credentials are required');
      }

      if (!config.auth.jwt.secret || config.auth.jwt.secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
      }

      if (!config.auth.encryption.key || config.auth.encryption.key.length !== 64) {
        throw new Error('ENCRYPTION_KEY must be exactly 64 characters long');
      }

      // Validate scoring weights sum to 1.0
      const weightsSum =
        config.scoring.weights.username +
        config.scoring.weights.displayName +
        config.scoring.weights.profileImage +
        config.scoring.weights.metadata;

      if (Math.abs(weightsSum - 1.0) > 0.001) {
        throw new Error('Scoring weights must sum to 1.0');
      }

      // Validate thresholds are in correct order
      if (
        config.scoring.thresholds.low >= config.scoring.thresholds.medium ||
        config.scoring.thresholds.medium >= config.scoring.thresholds.high
      ) {
        throw new Error('Scoring thresholds must be in ascending order (low < medium < high)');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async connectDatabase(): Promise<void> {
    try {
      logger.info('Connecting to database...');

      // Test database connection
      await prisma.$connect();

      // Run a simple query to verify connection
      await prisma.$queryRaw`SELECT 1`;

      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  private async connectRedis(): Promise<void> {
    try {
      logger.info('Connecting to Redis...');

      // Check if Redis is already connected or connecting
      if (redisClient.status === 'ready') {
        logger.info('✅ Redis already connected');
        return;
      }

      if (redisClient.status === 'connecting') {
        logger.info('Redis is already connecting, waiting...');
        // Wait for connection to complete
        await new Promise((resolve, reject) => {
          redisClient.once('ready', resolve);
          redisClient.once('error', reject);
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('Redis connection timeout')), 10000);
        });
        logger.info('✅ Redis connection completed');
        return;
      }

      // Only connect if status is 'end', 'close', or 'wait'
      if (['end', 'close', 'wait'].includes(redisClient.status)) {
        await redisClient.connect();
      }

      // Test Redis connection
      await redisClient.ping();

      logger.info('✅ Redis connected successfully');
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  private async initializeQueues(): Promise<void> {
    try {
      logger.info('Initializing message queues...');
      await initializeQueues();
      logger.info('✅ Message queues initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize message queues:', error);
      throw error;
    }
  }

  private async startMetricsServer(): Promise<void> {
    try {
      logger.info('Starting metrics server...');
      await metricsServer.start();
      logger.info('✅ Metrics server started successfully');
    } catch (error) {
      logger.error('❌ Failed to start metrics server:', error);
      throw error;
    }
  }

  private async startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer = createServer(appInstance.getApp());

      this.httpServer.on('error', (error: Error & { code?: string }) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${config.app.port} is already in use`);
        } else {
          logger.error('❌ HTTP server error:', error);
        }
        reject(error);
      });

      this.httpServer.on('listening', () => {
        logger.info('✅ HTTP server started successfully');
        resolve();
      });

      // Set server timeouts
      this.httpServer.timeout = 30000; // 30 seconds
      this.httpServer.keepAliveTimeout = 5000; // 5 seconds
      this.httpServer.headersTimeout = 6000; // 6 seconds

      // Start listening
      this.httpServer.listen(config.app.port, () => {
        logger.info(`HTTP server listening on port ${config.app.port}`);
      });
    });
  }

  private setupGracefulShutdown(): void {
    // Handle different shutdown signals
    const signals: ('SIGTERM' | 'SIGINT')[] = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal} signal, starting graceful shutdown...`);
        await this.shutdown(0);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      logger.error('Uncaught Exception:', error);
      await this.shutdown(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      await this.shutdown(1);
    });

    // Handle memory warnings
    process.on('warning', (warning) => {
      logger.warn('Process Warning:', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });

    // Monitor memory usage
    if (config.debugging.memory.limitMB > 0) {
      setInterval(() => {
        const memUsage = process.memoryUsage();
        const memUsageMB = memUsage.heapUsed / 1024 / 1024;
        const memLimitMB = config.debugging.memory.limitMB;
        const warningThreshold = memLimitMB * config.debugging.memory.warningThreshold;

        if (memUsageMB > warningThreshold) {
          logger.warn(`High memory usage detected: ${memUsageMB.toFixed(2)}MB / ${memLimitMB}MB`);
        }

        if (memUsageMB > memLimitMB) {
          logger.error(`Memory limit exceeded: ${memUsageMB.toFixed(2)}MB / ${memLimitMB}MB`);
          this.shutdown(1);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private async shutdown(exitCode: number): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info('🛑 Starting graceful shutdown...');

    const shutdownTimeout = setTimeout(() => {
      logger.error('❌ Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 15000); // 15 seconds timeout

    try {
      // Stop accepting new requests
      if (this.httpServer) {
        logger.info('Closing HTTP server...');
        await new Promise<void>((resolve) => {
          this.httpServer!.close(() => {
            logger.info('✅ HTTP server closed');
            resolve();
          });
        });
      }

      // Stop metrics server
      if (config.monitoring.metrics.enabled) {
        logger.info('Stopping metrics server...');
        await metricsServer.stop();
        logger.info('✅ Metrics server stopped');
      }

      // Close message queues
      logger.info('Closing message queues...');
      await closeQueues();
      logger.info('✅ Message queues closed');

      // Close Redis connections
      if (redisClient.status === 'ready') {
        logger.info('Closing Redis connection...');
        await redisClient.quit();
        logger.info('✅ Redis connection closed');
      }

      // Close app-specific resources
      logger.info('Closing application resources...');
      await appInstance.close();
      logger.info('✅ Application resources closed');

      // Close database connection
      logger.info('Closing database connection...');
      await prisma.$disconnect();
      logger.info('✅ Database connection closed');

      clearTimeout(shutdownTimeout);
      logger.info('✅ Graceful shutdown completed');
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      clearTimeout(shutdownTimeout);
    } finally {
      process.exit(exitCode);
    }
  }
}

// Start the server
const server = new Server();

// Handle startup
if (import.meta.url === `file://${process.argv[1]}`) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { server };
export default server;
