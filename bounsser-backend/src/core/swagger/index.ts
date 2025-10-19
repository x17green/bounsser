import { openApiSpec } from './openapi.spec';
import { authPaths } from './paths/auth.paths';

/**
 * Complete OpenAPI specification for the Bouncer Backend API.
 *
 * This module combines the base OpenAPI specification with all path definitions
 * to create a comprehensive API documentation that can be used with Swagger UI
 * and other OpenAPI tools.
 *
 * @module OpenAPIIndex
 * @version 1.0.0
 * @since 2024-01-15
 */

/**
 * Complete OpenAPI specification with all paths defined.
 */
export const completeOpenApiSpec = {
  ...openApiSpec,
  paths: {
    // Authentication endpoints
    ...authPaths,

    // Health check endpoint
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check endpoint',
        description: 'Returns the current health status of the API and its dependencies',
        operationId: 'healthCheck',
        security: [],
        responses: {
          '200': {
            description: 'System is healthy',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/HealthStatus' },
                      },
                    },
                  ],
                },
                example: {
                  success: true,
                  data: {
                    status: 'healthy',
                    timestamp: '2024-01-15T12:00:00Z',
                    uptime: 86400,
                    services: {
                      database: 'healthy',
                      redis: 'healthy',
                      twitter_api: 'healthy',
                    },
                  },
                  message: 'System is healthy',
                },
              },
            },
          },
          '503': {
            description: 'System is unhealthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'ServiceUnavailable',
                  message: 'One or more services are unhealthy',
                },
              },
            },
          },
        },
      },
    },

    // Metrics endpoint
    '/metrics': {
      get: {
        tags: ['System'],
        summary: 'Prometheus metrics',
        description: 'Returns application metrics in Prometheus format',
        operationId: 'getMetrics',
        security: [],
        responses: {
          '200': {
            description: 'Metrics data',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  description: 'Prometheus-formatted metrics',
                },
                example: `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/health",status_code="200"} 42`,
              },
            },
          },
        },
      },
    },

    // User profile endpoints (basic definitions - can be expanded)
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get user profile',
        description: "Retrieves the authenticated user's complete profile information",
        operationId: 'getUserProfile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserProfile' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '404': { $ref: '#/components/responses/NotFoundError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user profile',
        description: "'Updates the authenticated user's profile information'",
        operationId: 'updateUserProfile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  displayName: {
                    type: 'string',
                    example: 'John Smith',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john.smith@example.com',
                  },
                  preferences: {
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
            },
          },
        },
        responses: {
          '200': {
            description: 'Profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '409': {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user account',
        description: 'Permanently deletes the user account and all associated data',
        operationId: 'deleteUserAccount',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  confirmation: {
                    type: 'string',
                    enum: ['DELETE_MY_ACCOUNT'],
                    example: 'DELETE_MY_ACCOUNT',
                    description: 'Confirmation text to prevent accidental deletion',
                  },
                  reason: {
                    type: 'string',
                    example: 'No longer using the service',
                    description: 'Optional reason for account deletion',
                  },
                },
                required: ['confirmation'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Account deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    // User settings endpoint
    '/users/settings': {
      get: {
        tags: ['Users'],
        summary: 'Get user settings',
        description: 'Retrieves user settings and preferences',
        operationId: 'getUserSettings',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Settings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserSettings' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user settings',
        description: 'Updates user settings and preferences',
        operationId: 'updateUserSettings',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSettings' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Settings updated successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserSettings' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    // Events endpoints (basic definitions)
    '/users/events': {
      get: {
        tags: ['Events'],
        summary: 'Get user events',
        description: 'Retrieves impersonation detection events for the authenticated user',
        operationId: 'getUserEvents',
        security: [{ BearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' },
          {
            name: 'status',
            in: 'query',
            description: 'Filter by event status',
            required: false,
            schema: {
              type: 'string',
              enum: ['pending', 'confirmed', 'dismissed'],
            },
          },
          {
            name: 'dateFrom',
            in: 'query',
            description: 'Filter events from this date',
            required: false,
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
          {
            name: 'dateTo',
            in: 'query',
            description: 'Filter events to this date',
            required: false,
            schema: {
              type: 'string',
              format: 'date-time',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Events retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            events: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/ImpersonationEvent' },
                            },
                            pagination: { $ref: '#/components/schemas/PaginationResponse' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/users/stats': {
      get: {
        tags: ['Analytics'],
        summary: 'Get user statistics',
        description: 'Retrieves user account statistics and summary',
        operationId: 'getUserStats',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/UserStats' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
};

/**
 * Export the complete OpenAPI specification for use in Swagger UI and other tools.
 */
export default completeOpenApiSpec;
