import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import RedisStore from 'connect-redis';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import completeOpenApiSpec from './swagger';

import { redisSessionClient } from '@/modules/shared/utils/redis';
import { logger } from '@/modules/shared/utils/logger';
import { errorHandler } from '@/core/middleware/errorHandler';
import { requestId } from '@/core/middleware/requestId';
import { maintenance } from '@/core/middleware/maintenance';
import { metricsMiddleware } from '@/core/middleware/metrics';
// Route imports
import { createApiRouter, createSystemRouter } from '@/core/routes';

export class App {
  public app: express.Application;
  private redisClient?: typeof redisSessionClient;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeRedisSession(): Promise<void> {
    try {
      this.redisClient = redisSessionClient;

      // Only connect if not already connected/connecting
      if (this.redisClient.status === 'end' || this.redisClient.status === 'close') {
        await this.redisClient.connect();
      } else if (this.redisClient.status === 'connecting') {
        // Wait for existing connection to complete
        await new Promise((resolve, reject) => {
          this.redisClient!.once('ready', resolve);
          this.redisClient!.once('error', reject);
          setTimeout(() => reject(new Error('Redis session connection timeout')), 10000);
        });
      }

      // Configure session with Redis store
      const redisStore = new RedisStore({
        client: this.redisClient,
        prefix: 'bouncer:sess:',
      });

      this.app.use(
        session({
          store: redisStore,
          secret: config.auth.session.secret,
          resave: false,
          saveUninitialized: false,
          rolling: true,
          cookie: {
            secure: config.app.isProduction,
            httpOnly: true,
            maxAge: config.auth.session.maxAge,
            sameSite: config.app.isProduction ? 'strict' : 'lax',
          },
          name: 'bouncer.sid',
        })
      );
    } catch (error) {
      logger.error('Failed to initialize Redis session store:', error);
      throw error;
    }
  }

  private initializeMiddleware(): void {
    // Request ID middleware (first)
    this.app.use(requestId);

    // Maintenance mode check
    if (config.maintenance.mode) {
      this.app.use(maintenance);
    }

    // Security middleware
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
          },
        },
        hsts: {
          maxAge: config.security.headers.hstsMaxAge,
          includeSubDomains: true,
          preload: true,
        },
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS configuration
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, curl, etc.)
          if (!origin) {
            return callback(null, true);
          }

          if (config.security.cors.origin.includes(origin) || config.app.isDevelopment) {
            return callback(null, true);
          }

          const msg =
            'The CORS policy for this site does not allow access from the specified Origin.';
          return callback(new Error(msg), false);
        },
        credentials: config.security.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'X-Request-ID',
          'X-API-Key',
        ],
        exposedHeaders: ['X-Request-ID'],
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP request logging
    const morganFormat = config.app.isDevelopment ? 'dev' : 'combined';

    this.app.use(
      morgan(morganFormat, {
        stream: {
          write: (message: string) => {
            logger.http(message.trim());
          },
        },
        skip: (req) => {
          // Skip health check and metrics endpoints in production
          if (config.app.isProduction) {
            return req.url?.includes('/health') || req.url?.includes('/metrics');
          }
          return false;
        },
      })
    );

    // Metrics middleware
    if (config.monitoring.metrics.enabled) {
      this.app.use(metricsMiddleware);
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.window,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.window / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Skip rate limiting for health checks and metrics
        return req.url?.includes('/health') || req.url?.includes('/metrics');
      },
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(config.rateLimit.window / 1000),
        });
      },
    });

    this.app.use('/api/', limiter);

    // Stricter rate limiting for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: config.rateLimit.endpoints.auth,
      message: {
        error: 'Too many authentication attempts, please try again later.',
      },
      skipSuccessfulRequests: true,
    });

    this.app.use('/api/auth/', authLimiter);

    // Initialize session middleware (async)
    this.initializeRedisSession().catch((error) => {
      logger.error('Failed to initialize session middleware:', error);
    });

    // Trust proxy for accurate IP addresses
    if (config.app.isProduction) {
      this.app.set('trust proxy', 1);
    }
  }

  private initializeRoutes(): void {
    // System routes (health, metrics)
    const systemRouter = createSystemRouter();
    this.app.use('/', systemRouter);

    // Only mount metrics if enabled

    // Only mount metrics if enabled
    if (!config.monitoring.metrics.enabled) {
      // Remove metrics routes if disabled
      this.app.use('/metrics', (req, res) => {
        res.status(404).json({ error: 'Metrics endpoint disabled' });
      });
    }

    // API Documentation (Swagger)
    if (config.development.enableSwagger && config.app.isDevelopment) {
      this.app.use(
        '/api-docs',
        swaggerUi.serve,

        swaggerUi.setup(completeOpenApiSpec, {
          explorer: true,
          customSiteTitle: 'Bouncer API Documentation',
          customCss: '.swagger-ui .topbar { display: none }',
          swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
          },
        })
      );
    }

    // API Routes with versioning
    const apiRouter = createApiRouter();

    // Mount API routes
    this.app.use(config.app.apiBasePath, apiRouter);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: config.app.name,
        version: config.app.version,
        environment: config.app.env,
        timestamp: new Date().toISOString(),
        status: 'operational',
        message: 'Bouncer API is running',
        documentation: config.development.enableSwagger ? `${config.app.url}/api-docs` : undefined,
      });
    });

    // Catch-all for undefined routes
    this.app.all('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
    });
    // }
  }

  private initializeErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  public async close(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        logger.info('Redis session client disconnected');
      }
    } catch (error) {
      logger.error('Error closing Redis session client:', error);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and export app instance
const appInstance = new App();
export const app = appInstance.getApp();
export { appInstance };
