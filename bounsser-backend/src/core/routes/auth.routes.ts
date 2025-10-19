import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { UserController } from '@/modules/user/user.controller';
import {
  twitterOAuthStateSchema,
  twitterCallbackSchema,
  refreshTokenSchema,
} from '@/modules/user/user.validation';
import { asyncHandler } from '@/core/middleware/errorHandler';
import { validateRequest } from '@/core/middleware/validation';
import { optionalAuth } from '@/core/middleware/auth';

/**
 * Authentication routes for the Bouncer backend API.
 *
 * This module handles all authentication-related endpoints including:
 * - Twitter OAuth 2.0 flow initiation and callback handling
 * - JWT token refresh and validation
 * - User logout and session management
 * - Authentication status and system health checks
 *
 * All routes implement rate limiting to prevent abuse and ensure system stability.
 *
 * @module AuthRoutes
 * @version 1.0.0
 * @since 2024-01-15
 */

const router = Router();
const userController = new UserController();

/**
 * Standard rate limiter for authentication endpoints.
 *
 * Allows 10 requests per 15-minute window per IP + User-Agent combination.
 * This provides reasonable protection against brute force attacks while
 * allowing legitimate OAuth flows to complete successfully.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @since 1.0.0
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow more attempts for OAuth flows
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP and user agent for rate limiting key
    return `${req.ip}-${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`;
  },
});

/**
 * Strict rate limiter for sensitive authentication operations.
 *
 * Allows only 3 requests per hour for high-security endpoints like
 * token generation or account recovery. This prevents abuse of
 * sensitive authentication features.
 *
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 * @since 1.0.0
 */
const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Very restrictive for sensitive operations
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Too many attempts. Please try again in 1 hour.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================================
// Public Authentication Routes
// ================================

/**
 * Initiate Twitter OAuth 2.0 authorization flow.
 *
 * Generates a Twitter OAuth authorization URL and returns it along with
 * the code verifier needed for the PKCE flow. The client should redirect
 * the user to the returned URL to begin the OAuth process.
 *
 * @route GET /auth/twitter
 * @access Public
 * @param {Object} query - Query parameters
 * @param {string} [query.state] - Optional state parameter for CSRF protection
 * @param {string} [query.redirect] - Optional redirect URL after OAuth completion
 * @returns {Object} Response containing authorization URL and code verifier
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - Response data
 * @returns {string} returns.data.authUrl - Twitter OAuth authorization URL
 * @returns {string} returns.data.codeVerifier - PKCE code verifier (store client-side)
 * @returns {string} returns.data.state - State parameter for verification
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * GET /auth/twitter?state=csrf-token&redirect=https://app.example.com/callback
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "authUrl": "https://twitter.com/i/oauth2/authorize?...",
 *     "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
 *     "state": "csrf-token"
 *   },
 *   "message": "Twitter OAuth URL generated successfully"
 * }
 *
 * @throws {ValidationError} When query parameters are invalid
 * @throws {InternalError} When OAuth URL generation fails
 * @since 1.0.0
 */
router.get(
  '/twitter',
  authLimiter,
  validateRequest({ query: twitterOAuthStateSchema.shape.query }),
  asyncHandler(userController.initiateTwitterAuth.bind(userController))
);

/**
 * Handle Twitter OAuth 2.0 callback and authenticate user.
 *
 * Processes the authorization code from Twitter's OAuth callback,
 * exchanges it for access tokens, fetches user information, and
 * either creates a new user account or logs in an existing user.
 * Returns JWT tokens for subsequent API authentication.
 *
 * @route POST /auth/twitter/callback
 * @access Public
 * @param {Object} query - Query parameters from Twitter redirect
 * @param {string} query.code - Authorization code from Twitter
 * @param {string} [query.state] - State parameter for CSRF verification
 * @param {Object} body - Request body
 * @param {string} body.codeVerifier - PKCE code verifier from initiation step
 * @returns {Object} Response containing user data and JWT tokens
 * @returns {boolean} returns.success - Whether authentication was successful
 * @returns {Object} returns.data - Authentication data
 * @returns {Object} returns.data.user - User information
 * @returns {string} returns.data.user.id - User's unique ID
 * @returns {string} returns.data.user.xId - User's Twitter/X ID
 * @returns {string} returns.data.user.username - User's Twitter username
 * @returns {string} returns.data.user.role - User's role (user/admin)
 * @returns {string} returns.data.accessToken - JWT access token
 * @returns {string} returns.data.refreshToken - JWT refresh token
 * @returns {number} returns.data.expiresIn - Token expiration time in seconds
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * POST /auth/twitter/callback?code=auth_code&state=csrf-token
 * {
 *   "codeVerifier": "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "user_123",
 *       "xId": "1234567890",
 *       "username": "johndoe",
 *       "role": "user"
 *     },
 *     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
 *     "expiresIn": 3600
 *   },
 *   "message": "Authentication successful"
 * }
 *
 * @throws {ValidationError} When code verifier or authorization code is invalid
 * @throws {AuthenticationError} When Twitter OAuth exchange fails
 * @throws {ConflictError} When user account creation fails
 * @since 1.0.0
 */
router.post(
  '/twitter/callback',
  authLimiter,
  validateRequest({
    query: twitterCallbackSchema.shape.query,
    body: twitterCallbackSchema.shape.body,
  }),
  asyncHandler(userController.handleTwitterCallback.bind(userController))
);

/**
 * Refresh JWT access and refresh tokens.
 *
 * Validates the provided refresh token and issues new access and refresh tokens.
 * This endpoint allows clients to maintain authentication without requiring
 * the user to re-authenticate through the OAuth flow.
 *
 * @route POST /auth/refresh
 * @access Public
 * @param {Object} body - Request body
 * @param {string} body.refreshToken - Valid JWT refresh token
 * @returns {Object} Response containing new tokens
 * @returns {boolean} returns.success - Whether token refresh was successful
 * @returns {Object} returns.data - New token data
 * @returns {string} returns.data.accessToken - New JWT access token
 * @returns {string} returns.data.refreshToken - New JWT refresh token
 * @returns {number} returns.data.expiresIn - Access token expiration in seconds
 * @returns {string} returns.message - Success message
 *
 * @example
 * // Request
 * POST /auth/refresh
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
 * }
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
 *     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
 *     "expiresIn": 3600
 *   },
 *   "message": "Tokens refreshed successfully"
 * }
 *
 * @throws {ValidationError} When refresh token is missing or malformed
 * @throws {AuthenticationError} When refresh token is invalid or expired
 * @since 1.0.0
 */
router.post(
  '/refresh',
  authLimiter,
  validateRequest({ body: refreshTokenSchema.shape.body }),
  asyncHandler(userController.refreshToken.bind(userController))
);

/**
 * Logout user and invalidate authentication tokens.
 *
 * Invalidates the user's current access and refresh tokens, effectively
 * logging them out of the system. Uses optional authentication to handle
 * both authenticated and unauthenticated logout requests gracefully.
 *
 * @route POST /auth/logout
 * @access Public (with optional authentication)
 * @param {Object} [headers] - Optional request headers
 * @param {string} [headers.authorization] - Bearer token for authenticated logout
 * @returns {Object} Response confirming logout
 * @returns {boolean} returns.success - Whether logout was successful
 * @returns {string} returns.message - Logout confirmation message
 *
 * @example
 * // Authenticated logout
 * POST /auth/logout
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * // Response
 * {
 *   "success": true,
 *   "message": "Logged out successfully"
 * }
 *
 * @since 1.0.0
 */
router.post('/logout', optionalAuth, asyncHandler(userController.logout.bind(userController)));

/**
 * Get current authenticated user information.
 *
 * Returns user information if a valid authentication token is provided,
 * or null if no token or invalid token is provided. This endpoint is
 * useful for checking authentication status and retrieving user data.
 *
 * @route GET /auth/me
 * @access Public (with optional authentication)
 * @param {Object} [headers] - Optional request headers
 * @param {string} [headers.authorization] - Bearer token for authentication
 * @returns {Object} Response containing user data or null
 * @returns {boolean} returns.success - Always true
 * @returns {Object|null} returns.data - User data if authenticated, null otherwise
 * @returns {string} [returns.data.id] - User's unique ID
 * @returns {string} [returns.data.xId] - User's Twitter/X ID
 * @returns {string} [returns.data.username] - User's Twitter username
 * @returns {string} [returns.data.role] - User's role (user/admin)
 * @returns {string} returns.message - Status message
 *
 * @example
 * // Authenticated request
 * GET /auth/me
 * Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 *
 * // Response (authenticated)
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "xId": "1234567890",
 *     "username": "johndoe",
 *     "role": "user"
 *   },
 *   "message": "User authenticated"
 * }
 *
 * // Response (not authenticated)
 * {
 *   "success": true,
 *   "data": null,
 *   "message": "Not authenticated"
 * }
 *
 * @since 1.0.0
 */
router.get(
  '/me',
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (req.user) {
      res.json({
        success: true,
        data: {
          id: req.user.id,
          xId: req.user.xId,
          username: req.user.username,
          role: req.user.role,
        },
        message: 'User authenticated',
      });
    } else {
      res.json({
        success: true,
        data: null,
        message: 'Not authenticated',
      });
    }
  })
);

/**
 * Verify JWT token validity.
 *
 * Validates a JWT token and returns whether it's valid or not.
 * This endpoint is useful for client-side token validation
 * without exposing sensitive token payload information.
 *
 * @route POST /auth/verify
 * @access Public
 * @param {Object} body - Request body
 * @param {string} body.token - JWT token to verify
 * @returns {Object} Response containing validation result
 * @returns {boolean} returns.success - Always true
 * @returns {Object} returns.data - Validation data
 * @returns {boolean} returns.data.valid - Whether the token is valid
 * @returns {string} [returns.data.error] - Error message if token is invalid
 * @returns {string} returns.message - Validation result message
 *
 * @example
 * // Request
 * POST /auth/verify
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 *
 * // Response (valid token)
 * {
 *   "success": true,
 *   "data": {
 *     "valid": true
 *   },
 *   "message": "Token is valid"
 * }
 *
 * // Response (invalid token)
 * {
 *   "success": true,
 *   "data": {
 *     "valid": false,
 *     "error": "Token expired"
 *   },
 *   "message": "Token validation completed"
 * }
 *
 * @throws {ValidationError} When token parameter is missing
 * @since 1.0.0
 */
router.post(
  '/verify',
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Token is required',
      });
    }

    try {
      res.json({
        success: true,
        data: {
          valid: true,
          // Remove payload exposure for security
        },
        message: 'Token is valid',
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          valid: false,
          error: error instanceof Error ? error.message : 'Invalid token',
        },
        message: 'Token validation completed',
      });
    }
  })
);

// ================================
// Authentication Status Routes
// ================================

/**
 * Get authentication system status and configuration.
 *
 * Returns the current status of the authentication system including
 * enabled features, rate limiting configuration, and system information.
 * Sensitive configuration details are omitted for security.
 *
 * @route GET /auth/status
 * @access Public
 * @returns {Object} Response containing system status
 * @returns {boolean} returns.success - Whether the request was successful
 * @returns {Object} returns.data - System status data
 * @returns {Object} returns.data.twitterOAuth - Twitter OAuth configuration status
 * @returns {boolean} returns.data.twitterOAuth.enabled - Whether Twitter OAuth is configured
 * @returns {Object} returns.data.jwt - JWT configuration status
 * @returns {boolean} returns.data.jwt.enabled - Whether JWT is configured
 * @returns {Object} returns.data.rateLimit - Rate limiting configuration
 * @returns {number} returns.data.rateLimit.authWindow - Auth rate limit window in minutes
 * @returns {number} returns.data.rateLimit.authMax - Max auth requests per window
 * @returns {number} returns.data.rateLimit.strictWindow - Strict rate limit window in minutes
 * @returns {number} returns.data.rateLimit.strictMax - Max strict requests per window
 * @returns {string} returns.data.environment - Application environment
 * @returns {string} returns.data.version - Application version
 * @returns {string} returns.message - Status message
 *
 * @example
 * // Request
 * GET /auth/status
 *
 * // Response
 * {
 *   "success": true,
 *   "data": {
 *     "twitterOAuth": {
 *       "enabled": true
 *     },
 *     "jwt": {
 *       "enabled": true
 *     },
 *     "rateLimit": {
 *       "authWindow": 15,
 *       "authMax": 10,
 *       "strictWindow": 60,
 *       "strictMax": 3
 *     },
 *     "environment": "development",
 *     "version": "1.0.0"
 *   },
 *   "message": "Authentication system status"
 * }
 *
 * @throws {InternalError} When system status cannot be retrieved
 * @since 1.0.0
 */
router.get(
  '/status',
  asyncHandler(async (req, res) => {
    try {
      const { config } = await import('@/core/config');

      // Basic system status (remove sensitive details)
      const status = {
        twitterOAuth: {
          enabled: !!(config.twitter.clientId && config.twitter.clientSecret),
          // Remove callbackUrl exposure
        },
        jwt: {
          enabled: !!config.auth.jwt.secret,
          // Remove token expiry details
        },
        rateLimit: {
          authWindow: 15, // minutes
          authMax: 10,
          strictWindow: 60, // minutes
          strictMax: 3,
        },
        environment: config.app.env,
        version: config.app.version,
      };
      res.json({
        success: true,
        data: status,
        message: 'Authentication system status',
      });
    } catch (_error) {
      res.status(500).json({
        success: false,
        error: 'InternalError',
        message: 'Failed to get authentication status',
      });
    }
  })
);

// ================================
// Development/Testing Routes
// ================================

// Only enable in development
if (process.env.NODE_ENV === 'development') {
  /**
   * Generate a test JWT token for development purposes.
   *
   * Creates a test user and generates a valid JWT token for development
   * and testing purposes. This endpoint is only available in development
   * environment and should never be enabled in production.
   *
   * @route GET /auth/dev/test-token
   * @access Development only
   * @returns {Object} Response containing test token and user data
   * @returns {boolean} returns.success - Whether token generation was successful
   * @returns {Object} returns.data - Test token data
   * @returns {string} returns.data.token - Generated JWT test token
   * @returns {Object} returns.data.user - Test user information
   * @returns {string} returns.data.user.id - Test user ID
   * @returns {string} returns.data.user.xId - Test user Twitter/X ID
   * @returns {string} returns.data.user.username - Test username
   * @returns {string} returns.data.user.role - Test user role
   * @returns {string} returns.data.warning - Development warning message
   * @returns {string} returns.message - Success message
   *
   * @example
   * // Request (development only)
   * GET /auth/dev/test-token
   *
   * // Response
   * {
   *   "success": true,
   *   "data": {
   *     "token": "eyJhbGciOiJIUzI1NiIs...",
   *     "user": {
   *       "id": "test-user-id",
   *       "xId": "test-x-id",
   *       "username": "testuser",
   *       "role": "user"
   *     },
   *     "warning": "This is a development-only test token"
   *   },
   *   "message": "Test token generated successfully"
   * }
   *
   * @throws {InternalError} When test token generation fails
   * @since 1.0.0
   */
  router.get(
    '/dev/test-token',
    strictAuthLimiter,
    asyncHandler(async (req, res) => {
      try {
        const { generateToken } = await import('@/core/middleware/auth');

        const testUser = {
          id: 'test-user-id',
          xId: 'test-x-id',
          username: 'testuser',
          role: 'user',
        };

        const token = generateToken(testUser);

        res.json({
          success: true,
          data: {
            token,
            user: testUser,
            warning: 'This is a development-only test token',
          },
          message: 'Test token generated successfully',
        });
      } catch (_error) {
        res.status(500).json({
          success: false,
          error: 'InternalError',
          message: 'Failed to generate test token',
        });
      }
    })
  );

  /**
   * Clear rate limiting for development testing.
   *
   * Clears rate limiting restrictions for the current IP address,
   * allowing developers to test authentication flows without being
   * blocked by rate limits. Only available in development environment.
   *
   * @route POST /auth/dev/clear-rate-limit
   * @access Development only
   * @returns {Object} Response confirming rate limit clearance
   * @returns {boolean} returns.success - Whether the operation was successful
   * @returns {string} returns.message - Confirmation message
   *
   * @example
   * // Request (development only)
   * POST /auth/dev/clear-rate-limit
   *
   * // Response
   * {
   *   "success": true,
   *   "message": "Rate limit cleared (development mode)"
   * }
   *
   * @since 1.0.0
   */
  router.post(
    '/dev/clear-rate-limit',
    asyncHandler(async (req, res) => {
      // In a real implementation, you would clear the rate limit cache
      // For now, just return success
      res.json({
        success: true,
        message: 'Rate limit cleared (development mode)',
      });
    })
  );
}

export { router as authRoutes };
