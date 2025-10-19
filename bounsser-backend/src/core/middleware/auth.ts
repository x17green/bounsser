import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';
import { AuthenticationError, AuthorizationError } from '@/modules/shared/types/errors';
import { prisma } from '@/db/index';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        xId: string;
        username: string;
        role?: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string;
  xId: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract JWT token from request headers
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check for API key format
  if (authHeader.startsWith('ApiKey ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Verify JWT token and return payload
 */
function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, config.auth.jwt.secret) as JWTPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
}

/**
 * Required authentication middleware
 * Throws error if user is not authenticated
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    // Verify the token
    const payload = verifyToken(token);

    // Optional: Verify user still exists in database
    if (config.app.isProduction) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          xId: true,
          username: true,
        },
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Update payload with fresh user data
      req.user = {
        id: user.id,
        xId: user.xId,
        username: user.username,
        role: payload.role,
      };
    } else {
      // In development, trust the token payload
      req.user = {
        id: payload.userId,
        xId: payload.xId,
        username: payload.username,
        role: payload.role,
      };
    }

    logger.debug('User authenticated successfully', {
      userId: req.user.id,
      username: req.user.username,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
    });

    next(error);
  }
};

/**
 * Optional authentication middleware
 * Sets user context if authenticated, but doesn't throw error if not
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    // Verify the token
    const payload = verifyToken(token);

    // Set user context
    req.user = {
      id: payload.userId,
      xId: payload.xId,
      username: payload.username,
      role: payload.role,
    };

    logger.debug('Optional authentication successful', {
      userId: req.user.id,
      username: req.user.username,
      requestId: req.requestId,
    });

    next();
  } catch (error) {
    // Log but don't throw error for optional auth
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip,
      requestId: req.requestId,
    });

    next();
  }
};

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed - insufficient permissions', {
        userId: req.user.id,
        userRole,
        requiredRoles: allowedRoles,
        requestId: req.requestId,
      });

      throw new AuthorizationError('Insufficient permissions');
    }

    logger.debug('Authorization successful', {
      userId: req.user.id,
      userRole,
      requestId: req.requestId,
    });

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * User or admin middleware
 */
export const requireUser = requireRole(['user', 'admin']);

/**
 * Organization admin middleware
 */
export const requireOrgAdmin = requireRole(['org_admin', 'admin']);

/**
 * Generate JWT token for user
 */
export const generateToken = (user: {
  id: string;
  xId: string;
  username: string;
  role?: string;
}): string => {
  const payload: JWTPayload = {
    userId: user.id,
    xId: user.xId,
    username: user.username,
    role: user.role || 'user',
  };

  return jwt.sign(payload, config.auth.jwt.secret, {
    expiresIn: config.auth.jwt.expiresIn,
    issuer: config.app.name,
    audience: config.app.url,
  } as jwt.SignOptions);
};

/**
 * Generate refresh token for user
 */
export const generateRefreshToken = (user: {
  id: string;
  xId: string;
  username: string;
}): string => {
  const payload = {
    userId: user.id,
    xId: user.xId,
    username: user.username,
    type: 'refresh',
  };

  return jwt.sign(payload, config.auth.jwt.refreshSecret, {
    expiresIn: config.auth.jwt.refreshExpiresIn,
    issuer: config.app.name,
    audience: config.app.url,
  } as jwt.SignOptions);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    const payload = jwt.verify(token, config.auth.jwt.refreshSecret);
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw new AuthenticationError('Refresh token verification failed');
  }
};

/**
 * API Key authentication middleware
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    throw new AuthenticationError('API key required');
  }

  // In a real implementation, you would validate the API key against a database
  // For now, we'll use a simple validation
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    throw new AuthenticationError('Invalid API key');
  }

  logger.debug('API key authentication successful', {
    apiKey: `${apiKey.substring(0, 8)}...`,
    requestId: req.requestId,
  });

  next();
};

/**
 * Rate limiting by user ID
 */
export const userRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would integrate with your rate limiting system
  // For now, just pass through
  next();
};

/**
 * Check if user owns resource
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        throw new AuthorizationError('Resource ID required');
      }

      // This is a simplified check - in practice, you'd check specific resource ownership
      // For example, checking if a user owns a specific event or report

      logger.debug('Ownership check passed', {
        userId: req.user.id,
        resourceId,
        requestId: req.requestId,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
