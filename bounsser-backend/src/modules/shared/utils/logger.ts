import path from 'path';
import { fileURLToPath } from 'url';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config } from '@/core/config';

const __filename = fileURLToPath(import.meta.url);
// Note: __dirname not needed for current implementation

// Define log levels with colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    const serviceStr = service ? `[${service}]` : '';
    return `${timestamp} ${level} ${serviceStr}: ${message} ${metaStr}`;
  })
);

// Custom format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, service, stack, requestId, userId, ...meta }) => {
      const logEntry: any = {
        timestamp,
        level,
        message,
        service: service || 'bouncer-backend',
      };

      if (stack) {
        logEntry.stack = stack;
      }
      if (requestId) {
        logEntry.requestId = requestId;
      }
      if (userId) {
        logEntry.userId = userId;
      }

      Object.assign(logEntry, meta);

      return JSON.stringify(logEntry);
    }
  )
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: config.monitoring.logging.level,
    format: config.app.isDevelopment ? developmentFormat : productionFormat,
    handleExceptions: true,
    handleRejections: true,
  })
);

// File transports for production
if (config.app.isProduction) {
  // Ensure logs directory exists
  const logsDir = path.resolve(process.cwd(), 'logs');

  // Error log file (errors only)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: config.monitoring.logging.datePattern,
      level: 'error',
      format: productionFormat,
      maxSize: config.monitoring.logging.maxSize,
      maxFiles: config.monitoring.logging.maxFiles,
      handleExceptions: true,
      handleRejections: true,
      zippedArchive: true,
    })
  );

  // Combined log file (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: config.monitoring.logging.datePattern,
      level: config.monitoring.logging.level,
      format: productionFormat,
      maxSize: config.monitoring.logging.maxSize,
      maxFiles: config.monitoring.logging.maxFiles,
      zippedArchive: true,
    })
  );

  // HTTP access log
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: config.monitoring.logging.datePattern,
      level: 'http',
      format: productionFormat,
      maxSize: config.monitoring.logging.maxSize,
      maxFiles: config.monitoring.logging.maxFiles,
      zippedArchive: true,
    })
  );

  // Audit log for sensitive operations
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: config.monitoring.logging.datePattern,
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, action, userId, ip, ...meta }) => {
          if (action) {
            const auditEntry = {
              timestamp,
              level,
              message,
              action,
              userId,
              ip,
              ...meta,
            };
            return JSON.stringify(auditEntry);
          }
          return '';
        })
      ),
      maxSize: config.monitoring.logging.maxSize,
      maxFiles: '30d', // Keep audit logs for 30 days
      zippedArchive: true,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: config.monitoring.logging.level,
  format: config.app.isDevelopment ? developmentFormat : productionFormat,
  transports,
  exitOnError: false,
  silent: config.app.isTest && !process.env.ENABLE_TEST_LOGGING,
});

// Create child loggers for different services
export const createServiceLogger = (service: string) => {
  return logger.child({ service });
};

// Specialized loggers
export const auditLogger = createServiceLogger('audit');
export const securityLogger = createServiceLogger('security');
export const performanceLogger = createServiceLogger('performance');
export const twitterLogger = createServiceLogger('twitter-api');
export const queueLogger = createServiceLogger('queue');
export const dbLogger = createServiceLogger('database');

// Enhanced logging methods with context
export const logWithContext = {
  error: (message: string, context?: Record<string, any>, error?: Error) => {
    logger.error(message, {
      ...context,
      ...(error && {
        error: error.message,
        stack: error.stack,
        name: error.name,
      }),
    });
  },

  warn: (message: string, context?: Record<string, any>) => {
    logger.warn(message, context);
  },

  info: (message: string, context?: Record<string, any>) => {
    logger.info(message, context);
  },

  debug: (message: string, context?: Record<string, any>) => {
    logger.debug(message, context);
  },

  http: (message: string, context?: Record<string, any>) => {
    logger.http(message, context);
  },
};

// Security-specific logging
export const logSecurity = {
  authAttempt: (userId: string, ip: string, success: boolean, reason?: string) => {
    securityLogger.info('Authentication attempt', {
      action: 'auth_attempt',
      userId,
      ip,
      success,
      reason,
    });
  },

  accessDenied: (userId: string, resource: string, ip: string, reason?: string) => {
    securityLogger.warn('Access denied', {
      action: 'access_denied',
      userId,
      resource,
      ip,
      reason,
    });
  },

  suspiciousActivity: (
    userId: string,
    activity: string,
    ip: string,
    details?: Record<string, any>
  ) => {
    securityLogger.warn('Suspicious activity detected', {
      action: 'suspicious_activity',
      userId,
      activity,
      ip,
      ...details,
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string, limit: number) => {
    securityLogger.warn('Rate limit exceeded', {
      action: 'rate_limit_exceeded',
      ip,
      endpoint,
      limit,
    });
  },
};

// Audit logging for compliance
export const logAudit = {
  userAction: (
    userId: string,
    action: string,
    resource: string,
    ip: string,
    details?: Record<string, any>
  ) => {
    auditLogger.info('User action performed', {
      action: 'user_action',
      userId,
      actionType: action,
      resource,
      ip,
      ...details,
    });
  },

  dataAccess: (
    userId: string,
    dataType: string,
    operation: string,
    ip: string,
    recordCount?: number
  ) => {
    auditLogger.info('Data access', {
      action: 'data_access',
      userId,
      dataType,
      operation,
      ip,
      recordCount,
    });
  },

  systemEvent: (event: string, details?: Record<string, any>) => {
    auditLogger.info('System event', {
      action: 'system_event',
      event,
      ...details,
    });
  },

  configChange: (userId: string, setting: string, oldValue: any, newValue: any, ip: string) => {
    auditLogger.info('Configuration changed', {
      action: 'config_change',
      userId,
      setting,
      oldValue,
      newValue,
      ip,
    });
  },
};

// Performance logging
export const logPerformance = {
  apiRequest: (
    method: string,
    path: string,
    duration: number,
    statusCode: number,
    userId?: string
  ) => {
    performanceLogger.info('API request completed', {
      method,
      path,
      duration,
      statusCode,
      userId,
    });
  },

  databaseQuery: (operation: string, table: string, duration: number, rowCount?: number) => {
    performanceLogger.debug('Database query executed', {
      operation,
      table,
      duration,
      rowCount,
    });
  },

  queueJob: (jobName: string, duration: number, success: boolean, error?: string) => {
    performanceLogger.info('Queue job processed', {
      jobName,
      duration,
      success,
      error,
    });
  },

  externalAPI: (
    service: string,
    endpoint: string,
    duration: number,
    statusCode: number,
    success: boolean
  ) => {
    performanceLogger.info('External API call', {
      service,
      endpoint,
      duration,
      statusCode,
      success,
    });
  },
};

// Twitter API specific logging
export const logTwitter = {
  apiCall: (
    endpoint: string,
    method: string,
    duration: number,
    success: boolean,
    rateLimitRemaining?: number
  ) => {
    twitterLogger.info('Twitter API call', {
      endpoint,
      method,
      duration,
      success,
      rateLimitRemaining,
    });
  },

  webhook: (event: string, userId?: string, tweetId?: string) => {
    twitterLogger.info('Twitter webhook received', {
      event,
      userId,
      tweetId,
    });
  },

  rateLimit: (endpoint: string, resetTime: Date, remaining: number) => {
    twitterLogger.warn('Twitter API rate limit approaching', {
      endpoint,
      resetTime,
      remaining,
    });
  },

  error: (endpoint: string, error: string, twitterCode?: string) => {
    twitterLogger.error('Twitter API error', {
      endpoint,
      error,
      twitterCode,
    });
  },
};

// Queue logging
export const logQueue = {
  jobAdded: (queueName: string, jobName: string, jobId: string, delay?: number) => {
    queueLogger.info('Job added to queue', {
      queueName,
      jobName,
      jobId,
      delay,
    });
  },

  jobProcessing: (queueName: string, jobName: string, jobId: string, attempt: number) => {
    queueLogger.info('Job processing started', {
      queueName,
      jobName,
      jobId,
      attempt,
    });
  },

  jobCompleted: (queueName: string, jobName: string, jobId: string, duration: number) => {
    queueLogger.info('Job completed successfully', {
      queueName,
      jobName,
      jobId,
      duration,
    });
  },

  jobFailed: (
    queueName: string,
    jobName: string,
    jobId: string,
    error: string,
    attempt: number
  ) => {
    queueLogger.error('Job failed', {
      queueName,
      jobName,
      jobId,
      error,
      attempt,
    });
  },

  jobRetry: (queueName: string, jobName: string, jobId: string, nextAttempt: Date) => {
    queueLogger.warn('Job scheduled for retry', {
      queueName,
      jobName,
      jobId,
      nextAttempt,
    });
  },
};

// Database logging
export const logDatabase = {
  query: (operation: string, table: string, duration: number, success: boolean) => {
    dbLogger.debug('Database query', {
      operation,
      table,
      duration,
      success,
    });
  },

  migration: (name: string, direction: 'up' | 'down', duration: number, success: boolean) => {
    dbLogger.info('Database migration', {
      name,
      direction,
      duration,
      success,
    });
  },

  connection: (event: 'connect' | 'disconnect' | 'error', details?: Record<string, any>) => {
    dbLogger.info(`Database ${event}`, details);
  },
};

// Utility functions
export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.child({ requestId, userId });
};

export const logException = (error: Error, context?: Record<string, any>) => {
  logger.error('Unhandled exception', {
    error: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logRejection = (reason: any, promise: Promise<any>, context?: Record<string, any>) => {
  logger.error('Unhandled promise rejection', {
    reason: reason?.message || String(reason),
    stack: reason?.stack,
    ...context,
  });
};

// Export main logger and utilities
export { logger };
export default logger;

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Logger health check
export const loggerHealthCheck = () => {
  try {
    logger.info('Logger health check - OK');
    return true;
  } catch (error) {
    console.error('Logger health check failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeLogger = async (): Promise<void> => {
  return new Promise((resolve) => {
    logger.on('finish', () => {
      resolve();
    });
    logger.end();
  });
};
