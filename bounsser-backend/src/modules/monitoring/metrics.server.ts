import { createServer } from 'http';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';
import { getMetrics } from '@/core/middleware/metrics';

class MetricsServer {
  private server?: ReturnType<typeof createServer>;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Metrics server is already running');
      return;
    }

    try {
      this.server = createServer(async (req, res) => {
        if (req.url === '/metrics' && req.method === 'GET') {
          try {
            const metrics = await getMetrics();
            res.writeHead(200, {
              'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
            });
            res.end(metrics);
          } catch (error) {
            logger.error('Failed to serve metrics:', error);
            res.writeHead(500);
            res.end('Internal Server Error');
          }
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      this.server.listen(config.monitoring.metrics.port, () => {
        this.isRunning = true;
        logger.info(`Metrics server started on port ${config.monitoring.metrics.port}`);
      });

      this.server.on('error', (error) => {
        logger.error('Metrics server error:', error);
        this.isRunning = false;
      });
    } catch (error) {
      logger.error('Failed to start metrics server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.server || !this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.isRunning = false;
        logger.info('Metrics server stopped');
        resolve();
      });
    });
  }

  isHealthy(): boolean {
    return this.isRunning;
  }
}

export const metricsServer = new MetricsServer();
