import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'bouncer-backend',
  version: config.app.version,
  environment: config.app.env,
});

// Enable the collection of default metrics
client.collectDefaultMetrics({
  register,
  prefix: 'bouncer_',
});

// Custom metrics
export const metrics = {
  // HTTP request duration histogram
  httpRequestDuration: new client.Histogram({
    name: 'bouncer_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'user_type'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    registers: [register],
  }),

  // HTTP request counter
  httpRequestTotal: new client.Counter({
    name: 'bouncer_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_type'],
    registers: [register],
  }),

  // Active connections gauge
  activeConnections: new client.Gauge({
    name: 'bouncer_active_connections',
    help: 'Number of active connections',
    registers: [register],
  }),

  // Database operations
  databaseOperations: new client.Counter({
    name: 'bouncer_database_operations_total',
    help: 'Total number of database operations',
    labelNames: ['operation', 'table', 'status'],
    registers: [register],
  }),

  databaseOperationDuration: new client.Histogram({
    name: 'bouncer_database_operation_duration_seconds',
    help: 'Duration of database operations in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    registers: [register],
  }),

  // Twitter API operations
  twitterApiCalls: new client.Counter({
    name: 'bouncer_twitter_api_calls_total',
    help: 'Total number of Twitter API calls',
    labelNames: ['endpoint', 'method', 'status'],
    registers: [register],
  }),

  twitterApiDuration: new client.Histogram({
    name: 'bouncer_twitter_api_duration_seconds',
    help: 'Duration of Twitter API calls in seconds',
    labelNames: ['endpoint', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  twitterRateLimit: new client.Gauge({
    name: 'bouncer_twitter_rate_limit_remaining',
    help: 'Remaining Twitter API rate limit',
    labelNames: ['endpoint'],
    registers: [register],
  }),

  // Queue operations
  queueJobs: new client.Counter({
    name: 'bouncer_queue_jobs_total',
    help: 'Total number of queue jobs',
    labelNames: ['queue', 'job_type', 'status'],
    registers: [register],
  }),

  queueJobDuration: new client.Histogram({
    name: 'bouncer_queue_job_duration_seconds',
    help: 'Duration of queue job processing in seconds',
    labelNames: ['queue', 'job_type'],
    buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
    registers: [register],
  }),

  queueSize: new client.Gauge({
    name: 'bouncer_queue_size',
    help: 'Current size of queues',
    labelNames: ['queue'],
    registers: [register],
  }),

  // Impersonation detection metrics
  detectionEvents: new client.Counter({
    name: 'bouncer_detection_events_total',
    help: 'Total number of impersonation detection events',
    labelNames: ['event_type', 'action', 'source'],
    registers: [register],
  }),

  detectionScore: new client.Histogram({
    name: 'bouncer_detection_score',
    help: 'Impersonation detection confidence scores',
    labelNames: ['event_type'],
    buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    registers: [register],
  }),

  // User metrics
  activeUsers: new client.Gauge({
    name: 'bouncer_active_users',
    help: 'Number of currently active users',
    labelNames: ['user_type'],
    registers: [register],
  }),

  userActions: new client.Counter({
    name: 'bouncer_user_actions_total',
    help: 'Total number of user actions',
    labelNames: ['action', 'user_type'],
    registers: [register],
  }),

  // Error metrics
  errorRate: new client.Counter({
    name: 'bouncer_errors_total',
    help: 'Total number of errors by type and component',
    labelNames: ['error_type', 'component', 'severity'],
    registers: [register],
  }),

  // Cache metrics
  cacheOperations: new client.Counter({
    name: 'bouncer_cache_operations_total',
    help: 'Total number of cache operations',
    labelNames: ['operation', 'result'],
    registers: [register],
  }),

  cacheHitRate: new client.Gauge({
    name: 'bouncer_cache_hit_rate',
    help: 'Cache hit rate percentage',
    registers: [register],
  }),

  // Notification metrics
  notifications: new client.Counter({
    name: 'bouncer_notifications_total',
    help: 'Total number of notifications sent',
    labelNames: ['type', 'channel', 'status'],
    registers: [register],
  }),

  // Authentication metrics
  authAttempts: new client.Counter({
    name: 'bouncer_auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['method', 'result'],
    registers: [register],
  }),

  // Rate limiting metrics
  rateLimitHits: new client.Counter({
    name: 'bouncer_rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'ip_class'],
    registers: [register],
  }),
};

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!config.monitoring.metrics.enabled) {
    return next();
  }

  const startTime = Date.now();

  // Increment active connections
  metrics.activeConnections.inc();

  // Override res.end to capture metrics when response is sent
  const originalEnd = res.end;
  res.end = function (this: Response, ..._args: any[]): Response {
    const duration = (Date.now() - startTime) / 1000;
    const route = getRoutePattern(req);
    const statusCode = res.statusCode.toString();
    const method = req.method;
    const userType = getUserType(req);

    // Record metrics
    metrics.httpRequestDuration.labels(method, route, statusCode, userType).observe(duration);

    metrics.httpRequestTotal.labels(method, route, statusCode, userType).inc();

    // Decrement active connections
    metrics.activeConnections.dec();

    // Log slow requests
    if (duration > 5) {
      logger.warn('Slow HTTP request detected', {
        method,
        route,
        statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId: req.requestId,
      });
    }

    // Call original end method
    return originalEnd.apply(this, arguments as any);
  };

  next();
};

// Helper function to get route pattern
function getRoutePattern(req: Request): string {
  // Extract route pattern from request
  if (req.route?.path) {
    return req.baseUrl + req.route.path;
  }

  // Fallback to URL pathname with parameter normalization
  let path = req.path;

  // Normalize common ID patterns
  path = path.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/:id');
  path = path.replace(/\/\d+/g, '/:id');
  path = path.replace(/\/[a-zA-Z0-9_-]{10,}/g, '/:id');

  return path;
}

// Helper function to determine user type
function getUserType(req: Request): string {
  // Check if user is authenticated and determine type
  if (req.headers.authorization) {
    // This would be determined by your auth middleware
    // For now, return 'authenticated'
    return 'authenticated';
  }

  // Check for API key
  if (req.headers['x-api-key']) {
    return 'api_client';
  }

  // Check if it's a webhook
  if (req.path.includes('/webhooks/')) {
    return 'webhook';
  }

  return 'anonymous';
}

// Function to record database operation metrics
export const recordDatabaseMetric = (
  operation: string,
  table: string,
  duration: number,
  success: boolean
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  const status = success ? 'success' : 'error';

  metrics.databaseOperations.labels(operation, table, status).inc();

  metrics.databaseOperationDuration.labels(operation, table).observe(duration / 1000);
};

// Function to record Twitter API metrics
export const recordTwitterAPIMetric = (
  endpoint: string,
  method: string,
  duration: number,
  statusCode: number,
  remainingRequests?: number
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  const status = statusCode < 400 ? 'success' : 'error';

  metrics.twitterApiCalls.labels(endpoint, method, status).inc();

  metrics.twitterApiDuration.labels(endpoint, method).observe(duration / 1000);

  if (remainingRequests !== undefined) {
    metrics.twitterRateLimit.labels(endpoint).set(remainingRequests);
  }
};

// Function to record queue job metrics
export const recordQueueJobMetric = (
  queueName: string,
  jobType: string,
  duration: number,
  success: boolean
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  const status = success ? 'completed' : 'failed';

  metrics.queueJobs.labels(queueName, jobType, status).inc();

  metrics.queueJobDuration.labels(queueName, jobType).observe(duration / 1000);
};

// Function to update queue size metrics
export const updateQueueSizeMetric = (queueName: string, size: number): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.queueSize.labels(queueName).set(size);
};

// Function to record detection event metrics
export const recordDetectionEventMetric = (
  eventType: string,
  action: string,
  source: string,
  score?: number
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.detectionEvents.labels(eventType, action, source).inc();

  if (score !== undefined) {
    metrics.detectionScore.labels(eventType).observe(score);
  }
};

// Function to record error metrics
export const recordErrorMetric = (
  errorType: string,
  component: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.errorRate.labels(errorType, component, severity).inc();
};

// Function to record cache metrics
export const recordCacheMetric = (operation: 'hit' | 'miss' | 'set' | 'delete'): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  const result = operation === 'hit' ? 'hit' : operation === 'miss' ? 'miss' : 'operation';

  metrics.cacheOperations.labels(operation, result).inc();
};

// Function to update cache hit rate
export const updateCacheHitRate = (hitRate: number): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.cacheHitRate.set(hitRate);
};

// Function to record notification metrics
export const recordNotificationMetric = (
  type: string,
  channel: string,
  status: 'sent' | 'failed' | 'queued'
): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.notifications.labels(type, channel, status).inc();
};

// Function to record authentication metrics
export const recordAuthMetric = (method: string, success: boolean): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  const result = success ? 'success' : 'failure';

  metrics.authAttempts.labels(method, result).inc();
};

// Function to record rate limit hits
export const recordRateLimitMetric = (endpoint: string, ipClass: string = 'unknown'): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.rateLimitHits.labels(endpoint, ipClass).inc();
};

// Function to update active users
export const updateActiveUsersMetric = (userType: string, count: number): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.activeUsers.labels(userType).set(count);
};

// Function to record user actions
export const recordUserActionMetric = (action: string, userType: string): void => {
  if (!config.monitoring.metrics.enabled) {
    return;
  }

  metrics.userActions.labels(action, userType).inc();
};

// Get metrics for Prometheus scraping
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};

// Get registry for external use
export const getRegistry = (): client.Registry => {
  return register;
};

// Health check for metrics system
export const metricsHealthCheck = (): boolean => {
  try {
    // Test that we can access the registry
    register.getSingleMetric('bouncer_http_requests_total');
    return true;
  } catch (error) {
    logger.error('Metrics health check failed:', error);
    return false;
  }
};

// Reset all metrics (useful for testing)
export const resetMetrics = (): void => {
  register.resetMetrics();
};

export { register };
