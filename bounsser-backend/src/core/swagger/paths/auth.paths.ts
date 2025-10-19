/**
 * Authentication endpoints OpenAPI path definitions.
 *
 * Defines all authentication-related API endpoints including OAuth flows,
 * token management, and user authentication status.
 *
 * @module AuthPaths
 * @version 1.0.0
 * @since 2025-10-10
 */

export const authPaths = {
  '/auth/twitter': {
    get: {
      tags: ['Authentication'],
      summary: 'Initiate Twitter OAuth 2.0 flow',
      description: `
        Generates a Twitter OAuth authorization URL for user authentication.
        Returns the authorization URL along with the code verifier needed for PKCE flow.
        The client should redirect the user to the returned URL to begin OAuth.
      `,
      operationId: 'initiateTwitterAuth',
      security: [],
      parameters: [
        {
          name: 'state',
          in: 'query',
          description: 'Optional state parameter for CSRF protection',
          required: false,
          schema: {
            type: 'string',
            example: 'csrf-token',
          },
        },
        {
          name: 'redirect',
          in: 'query',
          description: 'Optional redirect URL after OAuth completion',
          required: false,
          schema: {
            type: 'string',
            format: 'uri',
            example: 'https://app.example.com/callback',
          },
        },
      ],
      responses: {
        '200': {
          description: 'OAuth URL generated successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        $ref: '#/components/schemas/TwitterOAuthResponse',
                      },
                    },
                  },
                ],
              },
              example: {
                success: true,
                data: {
                  authUrl:
                    'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=...',
                  codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
                  state: 'csrf-token',
                },
                message: 'Twitter OAuth URL generated successfully',
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '429': { $ref: '#/components/responses/RateLimitError' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/twitter/callback': {
    post: {
      tags: ['Authentication'],
      summary: 'Handle Twitter OAuth callback',
      description: `
        Processes the authorization code from Twitter's OAuth callback,
        exchanges it for access tokens, fetches user information, and
        either creates a new user account or logs in an existing user.
      `,
      operationId: 'handleTwitterCallback',
      security: [],
      parameters: [
        {
          name: 'code',
          in: 'query',
          description: 'Authorization code from Twitter',
          required: true,
          schema: {
            type: 'string',
            example: 'auth_code_from_twitter',
          },
        },
        {
          name: 'state',
          in: 'query',
          description: 'State parameter for CSRF verification',
          required: false,
          schema: {
            type: 'string',
            example: 'csrf-token',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                codeVerifier: {
                  type: 'string',
                  description: 'PKCE code verifier from initiation step',
                  example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
                },
              },
              required: ['codeVerifier'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Authentication successful',
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
                          user: { $ref: '#/components/schemas/User' },
                          ...{ $ref: '#/components/schemas/AuthTokens' },
                        },
                      },
                    },
                  },
                ],
              },
              example: {
                success: true,
                data: {
                  user: {
                    id: 'user_123',
                    xId: '1234567890',
                    username: 'johndoe',
                    displayName: 'John Doe',
                    role: 'user',
                  },
                  accessToken: 'eyJhbGciOiJIUzI1NiIs...',
                  refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                  expiresIn: 3600,
                },
                message: 'Authentication successful',
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '409': {
          description: 'User account creation conflict',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'ConflictError',
                message: 'User account creation failed',
              },
            },
          },
        },
        '429': { $ref: '#/components/responses/RateLimitError' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh JWT tokens',
      description: `
        Validates the provided refresh token and issues new access and refresh tokens.
        This endpoint allows clients to maintain authentication without requiring
        the user to re-authenticate through the OAuth flow.
      `,
      operationId: 'refreshTokens',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: {
                  type: 'string',
                  description: 'Valid JWT refresh token',
                  example: 'eyJhbGciOiJIUzI1NiIs...',
                },
              },
              required: ['refreshToken'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Tokens refreshed successfully',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AuthTokens' },
                    },
                  },
                ],
              },
              example: {
                success: true,
                data: {
                  accessToken: 'eyJhbGciOiJIUzI1NiIs...',
                  refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                  expiresIn: 3600,
                },
                message: 'Tokens refreshed successfully',
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '401': { $ref: '#/components/responses/UnauthorizedError' },
        '429': { $ref: '#/components/responses/RateLimitError' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      description: `
        Invalidates the user's current access and refresh tokens, effectively
        logging them out of the system. Uses optional authentication to handle
        both authenticated and unauthenticated logout requests gracefully.
      `,
      operationId: 'logoutUser',
      security: [{ BearerAuth: [] }, {}],
      responses: {
        '200': {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
              example: {
                success: true,
                message: 'Logged out successfully',
              },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user info',
      description: `
        Returns user information if a valid authentication token is provided,
        or null if no token or invalid token is provided. This endpoint is
        useful for checking authentication status and retrieving user data.
      `,
      operationId: 'getCurrentUser',
      security: [{ BearerAuth: [] }, {}],
      responses: {
        '200': {
          description: 'User information retrieved',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        oneOf: [{ $ref: '#/components/schemas/User' }, { type: 'null' }],
                      },
                    },
                  },
                ],
              },
              examples: {
                authenticated: {
                  summary: 'Authenticated user',
                  value: {
                    success: true,
                    data: {
                      id: 'user_123',
                      xId: '1234567890',
                      username: 'johndoe',
                      role: 'user',
                    },
                    message: 'User authenticated',
                  },
                },
                unauthenticated: {
                  summary: 'Not authenticated',
                  value: {
                    success: true,
                    data: null,
                    message: 'Not authenticated',
                  },
                },
              },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/verify': {
    post: {
      tags: ['Authentication'],
      summary: 'Verify JWT token',
      description: `
        Validates a JWT token and returns whether it's valid or not.
        This endpoint is useful for client-side token validation
        without exposing sensitive token payload information.
      `,
      operationId: 'verifyToken',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT token to verify',
                  example: 'eyJhbGciOiJIUzI1NiIs...',
                },
              },
              required: ['token'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Token validation completed',
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
                          valid: {
                            type: 'boolean',
                            description: 'Whether the token is valid',
                          },
                          error: {
                            type: 'string',
                            description: 'Error message if token is invalid',
                          },
                        },
                        required: ['valid'],
                      },
                    },
                  },
                ],
              },
              examples: {
                valid: {
                  summary: 'Valid token',
                  value: {
                    success: true,
                    data: { valid: true },
                    message: 'Token is valid',
                  },
                },
                invalid: {
                  summary: 'Invalid token',
                  value: {
                    success: true,
                    data: {
                      valid: false,
                      error: 'Token expired',
                    },
                    message: 'Token validation completed',
                  },
                },
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/ValidationError' },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },

  '/auth/status': {
    get: {
      tags: ['Authentication'],
      summary: 'Get authentication system status',
      description: `
        Returns the current status of the authentication system including
        enabled features, rate limiting configuration, and system information.
        Sensitive configuration details are omitted for security.
      `,
      operationId: 'getAuthStatus',
      security: [],
      responses: {
        '200': {
          description: 'Authentication system status',
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
                          twitterOAuth: {
                            type: 'object',
                            properties: {
                              enabled: { type: 'boolean' },
                            },
                          },
                          jwt: {
                            type: 'object',
                            properties: {
                              enabled: { type: 'boolean' },
                            },
                          },
                          rateLimit: {
                            type: 'object',
                            properties: {
                              authWindow: { type: 'integer' },
                              authMax: { type: 'integer' },
                              strictWindow: { type: 'integer' },
                              strictMax: { type: 'integer' },
                            },
                          },
                          environment: { type: 'string' },
                          version: { type: 'string' },
                        },
                      },
                    },
                  },
                ],
              },
              example: {
                success: true,
                data: {
                  twitterOAuth: { enabled: true },
                  jwt: { enabled: true },
                  rateLimit: {
                    authWindow: 15,
                    authMax: 10,
                    strictWindow: 60,
                    strictMax: 3,
                  },
                  environment: 'development',
                  version: '1.0.0',
                },
                message: 'Authentication system status',
              },
            },
          },
        },
        '500': { $ref: '#/components/responses/InternalServerError' },
      },
    },
  },
};
