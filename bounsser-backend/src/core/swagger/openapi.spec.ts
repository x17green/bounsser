import { config } from '../config';

const api = config.app.apiFullPath;

/**
 * Comprehensive OpenAPI 3.0 specification for the Bouncer Backend API.
 *
 * This specification defines all API endpoints, request/response schemas,
 * authentication methods, and error responses for the impersonation detection system.
 *
 * @version 1.0.0
 * @since 2024-01-15
 */
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: `${config.app.name} API Documentation, ${config.app.version}`,
    version: '1.0.0',
    description: `
### Hybrid impersonation-detection bot for X (Twitter)

A comprehensive REST API for Twitter/X account impersonation detection and monitoring.

## Features

- **Twitter OAuth 2.0 Integration** - Secure user authentication
- **Real-time Impersonation Detection** - AI-powered suspicious account detection
- **Webhook Support** - Real-time notifications from Twitter
- **Comprehensive Analytics** - Detailed statistics and trend analysis
- **GDPR Compliance** - Data export and privacy controls
- **Multi-tenant Support** - Organization and team management

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

Rate limits are applied per IP address and authenticated user:
- **Standard API Endpoints**: 100 requests per 15 minutes
- **Authentication Endpoints**: 10 requests per 15 minutes
- **Sensitive Operations**: 3 requests per hour

## Response Format

All API responses follow a consistent format:

\`\`\`json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "error": string (only if success is false)
}
\`\`\`
    `,
    contact: {
      name: 'Bouncer API Support',
      email: 'api-support@bouncer.example.com',
      url: 'https://bouncer.example.com/support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    termsOfService: 'https://bouncer.example.com/terms',
  },
  servers: [
    {
      url: api || 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: api || 'https://api.bouncer.example.com',
      description: 'Production server',
    },
    {
      url: api || 'https://staging-api.bouncer.example.com',
      description: 'Staging server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from authentication endpoints',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service communication',
      },
    },
    schemas: {
      // Common Response Schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response data (varies by endpoint)',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
        },
        required: ['success', 'message'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'ValidationError',
          },
          message: {
            type: 'string',
            example: 'The provided data is invalid',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
        },
        required: ['success', 'error', 'message'],
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            example: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 20,
          },
          total: {
            type: 'integer',
            minimum: 0,
            example: 150,
          },
          pages: {
            type: 'integer',
            minimum: 0,
            example: 8,
          },
        },
        required: ['page', 'limit', 'total', 'pages'],
      },

      // User Schemas
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user_123',
            description: 'Unique user identifier',
          },
          xId: {
            type: 'string',
            example: '1234567890',
            description: 'Twitter/X user ID',
          },
          username: {
            type: 'string',
            example: 'johndoe',
            description: 'Twitter username',
          },
          displayName: {
            type: 'string',
            example: 'John Doe',
            description: 'User display name',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
            description: 'User email address',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            example: 'user',
            description: 'User role in the system',
          },
          profileImageUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://pbs.twimg.com/profile_images/...',
            description: 'User profile image URL',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
            description: 'Account creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
            description: 'Last profile update timestamp',
          },
        },
        required: ['id', 'xId', 'username', 'role', 'createdAt'],
      },
      UserProfile: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              subscription: {
                type: 'object',
                properties: {
                  plan: {
                    type: 'string',
                    enum: ['free', 'premium', 'enterprise'],
                    example: 'premium',
                  },
                  status: {
                    type: 'string',
                    enum: ['active', 'cancelled', 'expired'],
                    example: 'active',
                  },
                },
              },
              twitterIntegration: {
                type: 'object',
                properties: {
                  connected: {
                    type: 'boolean',
                    example: true,
                  },
                  lastSync: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T10:30:00Z',
                  },
                },
              },
            },
          },
        ],
      },
      UserSettings: {
        type: 'object',
        properties: {
          notifications: {
            type: 'object',
            properties: {
              email: { type: 'boolean', example: true },
              impersonationAlerts: { type: 'boolean', example: true },
              weeklyReports: { type: 'boolean', example: false },
            },
          },
          privacy: {
            type: 'object',
            properties: {
              profileVisibility: {
                type: 'string',
                enum: ['public', 'private'],
                example: 'private',
              },
              dataSharing: { type: 'boolean', example: false },
            },
          },
          monitoring: {
            type: 'object',
            properties: {
              autoDetection: { type: 'boolean', example: true },
              sensitivityLevel: {
                type: 'string',
                enum: ['low', 'medium', 'high'],
                example: 'medium',
              },
            },
          },
          ui: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                enum: ['light', 'dark', 'auto'],
                example: 'dark',
              },
              language: {
                type: 'string',
                example: 'en',
              },
            },
          },
        },
      },

      // Authentication Schemas
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIs...',
            description: 'JWT access token',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIs...',
            description: 'JWT refresh token',
          },
          expiresIn: {
            type: 'integer',
            example: 3600,
            description: 'Access token expiration time in seconds',
          },
        },
        required: ['accessToken', 'refreshToken', 'expiresIn'],
      },
      TwitterOAuthResponse: {
        type: 'object',
        properties: {
          authUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://twitter.com/i/oauth2/authorize?...',
            description: 'Twitter OAuth authorization URL',
          },
          codeVerifier: {
            type: 'string',
            example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
            description: 'PKCE code verifier (store client-side)',
          },
          state: {
            type: 'string',
            example: 'csrf-token',
            description: 'State parameter for verification',
          },
        },
        required: ['authUrl', 'codeVerifier', 'state'],
      },

      // Event Schemas
      ImpersonationEvent: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'event_123',
            description: 'Unique event identifier',
          },
          type: {
            type: 'string',
            enum: ['impersonation_detected', 'suspicious_activity', 'profile_copied'],
            example: 'impersonation_detected',
            description: 'Type of detection event',
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'dismissed'],
            example: 'pending',
            description: 'Current event status',
          },
          suspiciousAccount: {
            type: 'object',
            properties: {
              username: { type: 'string', example: 'john_doe_fake' },
              displayName: { type: 'string', example: 'John Doe' },
              profileImageUrl: { type: 'string', format: 'uri' },
              profileSimilarity: { type: 'number', minimum: 0, maximum: 1, example: 0.85 },
            },
          },
          analysis: {
            type: 'object',
            properties: {
              textSimilarity: { type: 'number', minimum: 0, maximum: 1, example: 0.92 },
              imageSimilarity: { type: 'number', minimum: 0, maximum: 1, example: 0.78 },
              behaviorScore: { type: 'number', minimum: 0, maximum: 1, example: 0.65 },
              riskLevel: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'critical'],
                example: 'high',
              },
            },
          },
          evidence: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'profile_text' },
                similarity: { type: 'number', example: 0.92 },
                description: { type: 'string', example: 'Bio text matches 92% with original' },
              },
            },
          },
          detectedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
            description: 'Detection timestamp',
          },
          reviewedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T11:00:00Z',
            description: 'Review timestamp (if reviewed)',
          },
        },
        required: ['id', 'type', 'status', 'suspiciousAccount', 'detectedAt'],
      },

      // Report Schemas
      ImpersonationReport: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'report_456',
            description: 'Unique report identifier',
          },
          suspiciousUsername: {
            type: 'string',
            example: 'fake_john_doe',
            description: 'Username of suspected impersonator',
          },
          reason: {
            type: 'string',
            enum: ['profile_impersonation', 'content_theft', 'identity_fraud', 'other'],
            example: 'profile_impersonation',
            description: 'Reason for reporting',
          },
          description: {
            type: 'string',
            example: 'This account is using my profile picture and bio',
            description: 'Detailed description of the impersonation',
          },
          evidence: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
            example: ['https://twitter.com/fake_john_doe'],
            description: 'URLs or descriptions of evidence',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            example: 'high',
            description: 'Priority level',
          },
          status: {
            type: 'string',
            enum: ['submitted', 'under_review', 'resolved', 'rejected'],
            example: 'submitted',
            description: 'Report status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T11:30:00Z',
            description: 'Report creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T12:00:00Z',
            description: 'Last update timestamp',
          },
        },
        required: ['id', 'suspiciousUsername', 'reason', 'status', 'createdAt'],
      },

      // Analytics Schemas
      UserStats: {
        type: 'object',
        properties: {
          events: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 15 },
              confirmed: { type: 'integer', example: 8 },
              dismissed: { type: 'integer', example: 5 },
              pending: { type: 'integer', example: 2 },
            },
          },
          reports: {
            type: 'object',
            properties: {
              submitted: { type: 'integer', example: 3 },
              resolved: { type: 'integer', example: 2 },
            },
          },
          protection: {
            type: 'object',
            properties: {
              threatsBlocked: { type: 'integer', example: 8 },
              lastScan: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:00:00Z',
              },
            },
          },
        },
      },
      AnalyticsData: {
        type: 'object',
        properties: {
          summary: {
            type: 'object',
            properties: {
              totalEvents: { type: 'integer', example: 25 },
              averagePerDay: { type: 'number', example: 0.83 },
              threatReduction: { type: 'number', example: 0.15 },
            },
          },
          timeSeries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', format: 'date', example: '2024-01-01' },
                events: { type: 'integer', example: 2 },
                confirmed: { type: 'integer', example: 1 },
              },
            },
          },
          trends: {
            type: 'object',
            properties: {
              direction: {
                type: 'string',
                enum: ['increasing', 'decreasing', 'stable'],
                example: 'decreasing',
              },
              changePercent: { type: 'number', example: -15.2 },
            },
          },
          topThreats: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'profile_impersonation' },
                count: { type: 'integer', example: 12 },
                percentage: { type: 'number', example: 48 },
              },
            },
          },
        },
      },

      // Notification Schemas
      Notification: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'notif_123',
            description: 'Unique notification identifier',
          },
          type: {
            type: 'string',
            enum: ['impersonation_detected', 'report_update', 'system_alert'],
            example: 'impersonation_detected',
            description: 'Notification type',
          },
          title: {
            type: 'string',
            example: 'New impersonation detected',
            description: 'Notification title',
          },
          message: {
            type: 'string',
            example: 'A suspicious account matching your profile has been detected',
            description: 'Notification message',
          },
          read: {
            type: 'boolean',
            example: false,
            description: 'Whether notification has been read',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00Z',
            description: 'Notification creation timestamp',
          },
          readAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T11:45:00Z',
            description: 'Timestamp when marked as read',
          },
        },
        required: ['id', 'type', 'title', 'message', 'read', 'createdAt'],
      },

      // Session Schemas
      UserSession: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'session_123',
            description: 'Unique session identifier',
          },
          deviceType: {
            type: 'string',
            enum: ['desktop', 'mobile', 'tablet'],
            example: 'desktop',
            description: 'Device type',
          },
          browser: {
            type: 'string',
            example: 'Chrome 120.0.0',
            description: 'Browser information',
          },
          os: {
            type: 'string',
            example: 'Windows 11',
            description: 'Operating system',
          },
          ipAddress: {
            type: 'string',
            example: '192.168.1.100',
            description: 'IP address',
          },
          location: {
            type: 'string',
            example: 'New York, NY',
            description: 'Geographic location',
          },
          current: {
            type: 'boolean',
            example: true,
            description: 'Whether this is the current session',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T09:00:00Z',
            description: 'Session creation timestamp',
          },
          lastActivity: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T11:30:00Z',
            description: 'Last activity timestamp',
          },
        },
        required: ['id', 'deviceType', 'current', 'createdAt', 'lastActivity'],
      },

      // Health Check Schema
      HealthStatus: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['healthy', 'degraded', 'unhealthy'],
            example: 'healthy',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T12:00:00Z',
          },
          uptime: {
            type: 'integer',
            example: 86400,
            description: 'Uptime in seconds',
          },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy'],
                example: 'healthy',
              },
              redis: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy'],
                example: 'healthy',
              },
              twitter_api: {
                type: 'string',
                enum: ['healthy', 'degraded', 'unhealthy'],
                example: 'healthy',
              },
            },
          },
        },
        required: ['status', 'timestamp', 'uptime', 'services'],
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        },
      },
      EventIdParam: {
        name: 'eventId',
        in: 'path',
        description: 'Unique event identifier',
        required: true,
        schema: {
          type: 'string',
        },
      },
      NotificationIdParam: {
        name: 'notificationId',
        in: 'path',
        description: 'Unique notification identifier',
        required: true,
        schema: {
          type: 'string',
        },
      },
      SessionIdParam: {
        name: 'sessionId',
        in: 'path',
        description: 'Unique session identifier',
        required: true,
        schema: {
          type: 'string',
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'AuthenticationError',
              message: 'Authentication required',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'AuthorizationError',
              message: 'Insufficient permissions',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'NotFoundError',
              message: 'The requested resource was not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'ValidationError',
              message: 'The provided data is invalid',
              details: {
                field: 'email',
                code: 'INVALID_FORMAT',
              },
            },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'RateLimitError',
              message: 'Too many requests. Please try again later.',
              retryAfter: 900,
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              error: 'InternalServerError',
              message: 'An unexpected error occurred',
            },
          },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User profile and settings management',
    },
    {
      name: 'Events',
      description: 'Impersonation detection events',
    },
    {
      name: 'Reports',
      description: 'Manual impersonation reports',
    },
    {
      name: 'Analytics',
      description: 'Statistics and analytics data',
    },
    {
      name: 'Notifications',
      description: 'User notifications and alerts',
    },
    {
      name: 'Sessions',
      description: 'User session management',
    },
    {
      name: 'System',
      description: 'System health and monitoring',
    },
  ],
  paths: {},
} as const;

/**
 * OpenAPI specification type for type safety.
 */
export type OpenAPISpec = typeof openApiSpec;
