import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ES module compatibility (for future use)
// const __filename = fileURLToPath(import.meta.url);

// Environment validation schema
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default('v1'),
  APP_NAME: z.string().default('Bouncer'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  DATABASE_URL_TEST: z.string().optional(),
  DB_POOL_MIN: z.coerce.number().min(1).default(2),
  DB_POOL_MAX: z.coerce.number().min(1).default(10),
  DB_TIMEOUT: z.coerce.number().default(30000),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_SESSION_URL: z.string().default('redis://localhost:6379/1'),

  // Twitter API
  TWITTER_API_KEY: z.string().min(1, 'Twitter API key is required'),
  TWITTER_API_SECRET: z.string().min(1, 'Twitter API secret is required'),
  TWITTER_ACCESS_TOKEN: z.string().min(1, 'Twitter access token is required'),
  TWITTER_ACCESS_TOKEN_SECRET: z.string().min(1, 'Twitter access token secret is required'),
  TWITTER_CLIENT_ID: z.string().min(1, 'Twitter client ID is required'),
  TWITTER_CLIENT_SECRET: z.string().min(1, 'Twitter client secret is required'),
  TWITTER_API_BASE_URL: z.string().url().default('https://api.twitter.com/2'),
  TWITTER_OAUTH_CALLBACK_URL: z.string().url(),
  TWITTER_RATE_LIMIT_WINDOW: z.coerce.number().default(900000),
  TWITTER_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(300),

  // Authentication & Security
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.coerce.number().default(86400000),
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'Encryption key must be exactly 64 characters')
    .default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  ENCRYPTION_IV_LENGTH: z.coerce.number().default(16),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  // BullMQ Queues
  QUEUE_CONCURRENCY_STREAM: z.coerce.number().default(5),
  QUEUE_CONCURRENCY_WEBHOOK: z.coerce.number().default(10),
  QUEUE_CONCURRENCY_SCORING: z.coerce.number().default(3),
  QUEUE_CONCURRENCY_NOTIFICATION: z.coerce.number().default(8),
  QUEUE_MAX_RETRIES: z.coerce.number().default(3),
  QUEUE_RETRY_DELAY: z.coerce.number().default(5000),

  // Email/SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Slack
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_SIGNING_SECRET: z.string().optional(),
  SLACK_DEFAULT_CHANNEL: z.string().optional(),

  // Discord
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),
  DISCORD_CHANNEL_ID: z.string().optional(),

  // Monitoring & Observability
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug']).default('info'),
  LOG_FILE_PATH: z.string().default('logs/app.log'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.coerce.number().default(5),
  LOG_DATE_PATTERN: z.string().default('YYYY-MM-DD'),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_PORT: z.coerce.number().default(9090),
  METRICS_PATH: z.string().default('/metrics'),
  HEALTH_CHECK_ENABLED: z.coerce.boolean().default(true),
  HEALTH_CHECK_PATH: z.string().default('/health'),

  // Scoring & Feature Flags
  SCORING_WEIGHTS_USERNAME: z.coerce.number().min(0).max(1).default(0.4),
  SCORING_WEIGHTS_DISPLAY_NAME: z.coerce.number().min(0).max(1).default(0.3),
  SCORING_WEIGHTS_PROFILE_IMAGE: z.coerce.number().min(0).max(1).default(0.2),
  SCORING_WEIGHTS_METADATA: z.coerce.number().min(0).max(1).default(0.1),
  THRESHOLD_LOW: z.coerce.number().min(0).max(1).default(0.3),
  THRESHOLD_MEDIUM: z.coerce.number().min(0).max(1).default(0.6),
  THRESHOLD_HIGH: z.coerce.number().min(0).max(1).default(0.8),
  FEATURE_AUTO_REPLY: z.coerce.boolean().default(false),
  FEATURE_ML_SCORING: z.coerce.boolean().default(false),
  FEATURE_IMAGE_ANALYSIS: z.coerce.boolean().default(true),
  FEATURE_ADVANCED_METRICS: z.coerce.boolean().default(true),

  // External Services
  VISION_API_KEY: z.string().optional(),
  VISION_API_URL: z.string().url().optional(),
  ML_SERVICE_URL: z.string().url().optional(),
  ML_SERVICE_API_KEY: z.string().optional(),
  WEBHOOK_SLACK: z.string().url().optional(),
  WEBHOOK_DISCORD: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: z.coerce.boolean().default(false),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(5),
  RATE_LIMIT_API_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WEBHOOK_MAX: z.coerce.number().default(1000),

  // CORS & Security
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
  SECURITY_HSTS_MAX_AGE: z.coerce.number().default(31536000),
  SECURITY_CONTENT_SECURITY_POLICY: z.string().default("default-src 'self'"),

  // Development & Testing
  DEV_ENABLE_SWAGGER: z.coerce.boolean().default(true),
  DEV_ENABLE_PLAYGROUND: z.coerce.boolean().default(true),
  DEV_MOCK_TWITTER_API: z.coerce.boolean().default(false),
  TEST_TIMEOUT: z.coerce.number().default(30000),
  TEST_DB_RESET: z.coerce.boolean().default(true),
  TEST_PARALLEL: z.coerce.boolean().default(false),

  // Deployment & Infrastructure
  DOCKER_REGISTRY: z.string().optional(),
  DOCKER_IMAGE_TAG: z.string().default('latest'),
  K8S_NAMESPACE: z.string().optional(),
  K8S_SERVICE_ACCOUNT: z.string().optional(),
  READINESS_PROBE_PATH: z.string().default('/ready'),
  LIVENESS_PROBE_PATH: z.string().default('/live'),

  // Backup & Maintenance
  BACKUP_ENABLED: z.coerce.boolean().default(true),
  BACKUP_SCHEDULE: z.string().default('0 2 * * *'),
  BACKUP_RETENTION_DAYS: z.coerce.number().default(30),
  BACKUP_S3_BUCKET: z.string().optional(),
  BACKUP_S3_REGION: z.string().optional(),
  MAINTENANCE_MODE: z.coerce.boolean().default(false),
  MAINTENANCE_MESSAGE: z.string().default('System under maintenance. Please try again later.'),

  // Debugging & Profiling
  DEBUG: z.string().optional(),
  DEBUG_COLORS: z.coerce.boolean().default(true),
  DEBUG_HIDE_DATE: z.coerce.boolean().default(false),
  ENABLE_PROFILING: z.coerce.boolean().default(false),
  PROFILING_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  MEMORY_LIMIT_MB: z.coerce.number().default(512),
  MEMORY_WARNING_THRESHOLD: z.coerce.number().min(0).max(1).default(0.8),
});

// Validate environment variables
const envVars = envSchema.parse(process.env);

// Configuration object with typed values
export const config = {
  // Application
  app: {
    name: envVars.APP_NAME,
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    url: envVars.APP_URL,
    version: envVars.API_VERSION,
    apiBasePath: `/api/${envVars.API_VERSION}`,
    apiFullPath: `${envVars.APP_URL}/api/${envVars.API_VERSION}`,
    isDevelopment: envVars.NODE_ENV === 'development',
    isProduction: envVars.NODE_ENV === 'production',
    isTest: envVars.NODE_ENV === 'test',
  },

  // Database
  database: {
    url: envVars.DATABASE_URL,
    testUrl: envVars.DATABASE_URL_TEST,
    pool: {
      min: envVars.DB_POOL_MIN,
      max: envVars.DB_POOL_MAX,
      timeout: envVars.DB_TIMEOUT,
    },
  },

  // Redis
  redis: {
    url: envVars.REDIS_URL,
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB,
    sessionUrl: envVars.REDIS_SESSION_URL,
  },

  // Twitter API
  twitter: {
    apiKey: envVars.TWITTER_API_KEY,
    apiSecret: envVars.TWITTER_API_SECRET,
    accessToken: envVars.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: envVars.TWITTER_ACCESS_TOKEN_SECRET,
    clientId: envVars.TWITTER_CLIENT_ID,
    clientSecret: envVars.TWITTER_CLIENT_SECRET,
    baseUrl: envVars.TWITTER_API_BASE_URL,
    callbackUrl: envVars.TWITTER_OAUTH_CALLBACK_URL,
    rateLimit: {
      window: envVars.TWITTER_RATE_LIMIT_WINDOW,
      maxRequests: envVars.TWITTER_RATE_LIMIT_MAX_REQUESTS,
    },
  },

  // Authentication & Security
  auth: {
    jwt: {
      secret: envVars.JWT_SECRET,
      expiresIn: envVars.JWT_EXPIRES_IN,
      refreshSecret: envVars.JWT_REFRESH_SECRET,
      refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
    },
    session: {
      secret: envVars.SESSION_SECRET,
      maxAge: envVars.SESSION_MAX_AGE,
    },
    encryption: {
      key: envVars.ENCRYPTION_KEY,
      ivLength: envVars.ENCRYPTION_IV_LENGTH,
    },
    bcrypt: {
      rounds: envVars.BCRYPT_ROUNDS,
    },
  },

  // BullMQ Queues
  queues: {
    concurrency: {
      stream: envVars.QUEUE_CONCURRENCY_STREAM,
      webhook: envVars.QUEUE_CONCURRENCY_WEBHOOK,
      scoring: envVars.QUEUE_CONCURRENCY_SCORING,
      notification: envVars.QUEUE_CONCURRENCY_NOTIFICATION,
    },
    retry: {
      maxRetries: envVars.QUEUE_MAX_RETRIES,
      delay: envVars.QUEUE_RETRY_DELAY,
    },
  },

  // Email
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: envVars.SMTP_SECURE,
      auth:
        envVars.SMTP_USER && envVars.SMTP_PASS
          ? {
              user: envVars.SMTP_USER,
              pass: envVars.SMTP_PASS,
            }
          : undefined,
    },
    from: envVars.EMAIL_FROM,
  },

  // External Integrations
  integrations: {
    slack: {
      botToken: envVars.SLACK_BOT_TOKEN,
      signingSecret: envVars.SLACK_SIGNING_SECRET,
      defaultChannel: envVars.SLACK_DEFAULT_CHANNEL,
      webhookUrl: envVars.WEBHOOK_SLACK,
    },
    discord: {
      botToken: envVars.DISCORD_BOT_TOKEN,
      guildId: envVars.DISCORD_GUILD_ID,
      channelId: envVars.DISCORD_CHANNEL_ID,
      webhookUrl: envVars.WEBHOOK_DISCORD,
    },
    vision: {
      apiKey: envVars.VISION_API_KEY,
      apiUrl: envVars.VISION_API_URL,
    },
    ml: {
      serviceUrl: envVars.ML_SERVICE_URL,
      apiKey: envVars.ML_SERVICE_API_KEY,
    },
  },

  // Monitoring & Observability
  monitoring: {
    logging: {
      level: envVars.LOG_LEVEL,
      filePath: envVars.LOG_FILE_PATH,
      maxSize: envVars.LOG_MAX_SIZE,
      maxFiles: envVars.LOG_MAX_FILES,
      datePattern: envVars.LOG_DATE_PATTERN,
    },
    metrics: {
      enabled: envVars.METRICS_ENABLED,
      port: envVars.METRICS_PORT,
      path: envVars.METRICS_PATH,
    },
    healthCheck: {
      enabled: envVars.HEALTH_CHECK_ENABLED,
      path: envVars.HEALTH_CHECK_PATH,
    },
  },

  // Scoring & Features
  scoring: {
    weights: {
      username: envVars.SCORING_WEIGHTS_USERNAME,
      displayName: envVars.SCORING_WEIGHTS_DISPLAY_NAME,
      profileImage: envVars.SCORING_WEIGHTS_PROFILE_IMAGE,
      metadata: envVars.SCORING_WEIGHTS_METADATA,
    },
    thresholds: {
      low: envVars.THRESHOLD_LOW,
      medium: envVars.THRESHOLD_MEDIUM,
      high: envVars.THRESHOLD_HIGH,
    },
    features: {
      autoReply: envVars.FEATURE_AUTO_REPLY,
      mlScoring: envVars.FEATURE_ML_SCORING,
      imageAnalysis: envVars.FEATURE_IMAGE_ANALYSIS,
      advancedMetrics: envVars.FEATURE_ADVANCED_METRICS,
    },
  },

  // Rate Limiting
  rateLimit: {
    window: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    skipSuccessfulRequests: envVars.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
    endpoints: {
      auth: envVars.RATE_LIMIT_AUTH_MAX,
      api: envVars.RATE_LIMIT_API_MAX,
      webhook: envVars.RATE_LIMIT_WEBHOOK_MAX,
    },
  },

  // CORS & Security
  security: {
    cors: {
      origin: envVars.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: envVars.CORS_CREDENTIALS,
    },
    headers: {
      hstsMaxAge: envVars.SECURITY_HSTS_MAX_AGE,
      contentSecurityPolicy: envVars.SECURITY_CONTENT_SECURITY_POLICY,
    },
  },

  // Development & Testing
  development: {
    enableSwagger: envVars.DEV_ENABLE_SWAGGER,
    enablePlayground: envVars.DEV_ENABLE_PLAYGROUND,
    mockTwitterApi: envVars.DEV_MOCK_TWITTER_API,
  },

  testing: {
    timeout: envVars.TEST_TIMEOUT,
    dbReset: envVars.TEST_DB_RESET,
    parallel: envVars.TEST_PARALLEL,
  },

  // Deployment
  deployment: {
    docker: {
      registry: envVars.DOCKER_REGISTRY,
      imageTag: envVars.DOCKER_IMAGE_TAG,
    },
    kubernetes: {
      namespace: envVars.K8S_NAMESPACE,
      serviceAccount: envVars.K8S_SERVICE_ACCOUNT,
    },
    probes: {
      readiness: envVars.READINESS_PROBE_PATH,
      liveness: envVars.LIVENESS_PROBE_PATH,
    },
  },

  // Backup & Maintenance
  backup: {
    enabled: envVars.BACKUP_ENABLED,
    schedule: envVars.BACKUP_SCHEDULE,
    retentionDays: envVars.BACKUP_RETENTION_DAYS,
    s3: {
      bucket: envVars.BACKUP_S3_BUCKET,
      region: envVars.BACKUP_S3_REGION,
    },
  },

  maintenance: {
    mode: envVars.MAINTENANCE_MODE,
    message: envVars.MAINTENANCE_MESSAGE,
  },

  // Debugging & Profiling
  debugging: {
    debug: envVars.DEBUG,
    colors: envVars.DEBUG_COLORS,
    hideDate: envVars.DEBUG_HIDE_DATE,
    profiling: {
      enabled: envVars.ENABLE_PROFILING,
      sampleRate: envVars.PROFILING_SAMPLE_RATE,
    },
    memory: {
      limitMB: envVars.MEMORY_LIMIT_MB,
      warningThreshold: envVars.MEMORY_WARNING_THRESHOLD,
    },
  },
} as const;

// Type export
export type Config = typeof config;

// Helper functions
export const isDevelopment = () => config.app.isDevelopment;
export const isProduction = () => config.app.isProduction;
export const isTest = () => config.app.isTest;

// Validation helper
export const validateConfig = () => {
  try {
    envSchema.parse(process.env);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

// Export for testing
export { envSchema };
