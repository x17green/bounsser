import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import { config } from '@/core/config';
import { logger } from '@/modules/shared/utils/logger';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
} from '@/modules/shared/types/errors';

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
  requestId?: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  error:
    | Error
    | AppError
    | ValidationError
    | AuthenticationError
    | AuthorizationError
    | NotFoundError
    | RateLimitError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string;
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.url;

  // Log error details
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Handle different error types
  if (error instanceof AppError) {
    handleAppError(error, req, res, requestId, timestamp, path);
  } else if (error instanceof ZodError) {
    handleZodError(error, req, res, requestId, timestamp, path);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error, req, res, requestId, timestamp, path);
  } else if (error.name === 'ValidationError') {
    handleMongooseValidationError(error, req, res, requestId, timestamp, path);
  } else if (error.name === 'CastError') {
    handleCastError(error, req, res, requestId, timestamp, path);
  } else if (error.name === 'JsonWebTokenError') {
    handleJWTError(error, req, res, requestId, timestamp, path);
  } else if (error.name === 'TokenExpiredError') {
    handleTokenExpiredError(error, req, res, requestId, timestamp, path);
  } else if (error.name === 'MulterError') {
    handleMulterError(error, req, res, requestId, timestamp, path);
  } else if (error.message.includes('ECONNREFUSED')) {
    handleConnectionError(error, req, res, requestId, timestamp, path);
  } else if (error.message.includes('ENOTFOUND')) {
    handleDNSError(error, req, res, requestId, timestamp, path);
  } else {
    handleGenericError(error, req, res, requestId, timestamp, path);
  }
};

function handleAppError(
  error: AppError,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: error.name,
    message: error.message,
    status: error.statusCode,
    timestamp,
    path,
    requestId,
  };

  if (error.details) {
    response.details = error.details;
  }

  if (config.app.isDevelopment && error.stack) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}

function handleZodError(
  error: ZodError,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const validationErrors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: 'received' in err ? err.received : undefined,
  }));

  const response: ErrorResponse = {
    error: 'ValidationError',
    message: 'Request validation failed',
    status: 400,
    timestamp,
    path,
    requestId,
    details: {
      validationErrors,
      totalErrors: error.errors.length,
    },
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(400).json(response);
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  let message = 'Database operation failed';
  let status = 500;
  let details: any = undefined;

  switch (error.code) {
    case 'P2002':
      message = 'A record with this data already exists';
      status = 409;
      details = {
        constraint: error.meta?.target,
        fields: error.meta?.target,
      };
      break;
    case 'P2025':
      message = 'Record not found';
      status = 404;
      break;
    case 'P2003':
      message = 'Foreign key constraint violation';
      status = 400;
      details = {
        field: error.meta?.field_name,
      };
      break;
    case 'P2014':
      message = 'Required relation is missing';
      status = 400;
      details = {
        relation: error.meta?.relation_name,
      };
      break;
    case 'P2021':
      message = 'Table does not exist in the database';
      status = 500;
      break;
    case 'P2022':
      message = 'Column does not exist in the database';
      status = 500;
      break;
    case 'P1001':
      message = 'Cannot reach database server';
      status = 503;
      break;
    case 'P1002':
      message = 'Database server timeout';
      status = 503;
      break;
    default:
      message = 'Database error occurred';
      status = 500;
  }

  const response: ErrorResponse = {
    error: 'DatabaseError',
    message,
    status,
    timestamp,
    path,
    requestId,
    details,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(status).json(response);
}

function handleMongooseValidationError(
  error: any,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const validationErrors = Object.values(error.errors || {}).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));

  const response: ErrorResponse = {
    error: 'ValidationError',
    message: 'Data validation failed',
    status: 400,
    timestamp,
    path,
    requestId,
    details: {
      validationErrors,
    },
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(400).json(response);
}

function handleCastError(
  error: any,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: 'CastError',
    message: `Invalid ${error.path}: ${error.value}`,
    status: 400,
    timestamp,
    path,
    requestId,
    details: {
      field: error.path,
      value: error.value,
      kind: error.kind,
    },
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(400).json(response);
}

function handleJWTError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: 'AuthenticationError',
    message: 'Invalid token',
    status: 401,
    timestamp,
    path,
    requestId,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(401).json(response);
}

function handleTokenExpiredError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: 'AuthenticationError',
    message: 'Token has expired',
    status: 401,
    timestamp,
    path,
    requestId,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(401).json(response);
}

function handleMulterError(
  error: any,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  let message = 'File upload error';
  let status = 400;

  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      status = 413;
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected field';
      break;
    case 'LIMIT_PART_COUNT':
      message = 'Too many parts';
      break;
    case 'LIMIT_FIELD_KEY':
      message = 'Field name too long';
      break;
    case 'LIMIT_FIELD_VALUE':
      message = 'Field value too long';
      break;
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields';
      break;
  }

  const response: ErrorResponse = {
    error: 'FileUploadError',
    message,
    status,
    timestamp,
    path,
    requestId,
    details: {
      code: error.code,
      field: error.field,
    },
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(status).json(response);
}

function handleConnectionError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: 'ServiceUnavailable',
    message: 'External service connection failed',
    status: 503,
    timestamp,
    path,
    requestId,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(503).json(response);
}

function handleDNSError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  const response: ErrorResponse = {
    error: 'ServiceUnavailable',
    message: 'DNS resolution failed',
    status: 503,
    timestamp,
    path,
    requestId,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(503).json(response);
}

function handleGenericError(
  error: Error,
  req: Request,
  res: Response,
  requestId: string,
  timestamp: string,
  path: string
): void {
  // Log unexpected errors with more detail
  logger.error('Unexpected error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
  });

  const response: ErrorResponse = {
    error: 'InternalServerError',
    message: config.app.isProduction ? 'An unexpected error occurred' : error.message,
    status: 500,
    timestamp,
    path,
    requestId,
  };

  if (config.app.isDevelopment) {
    response.stack = error.stack;
  }

  res.status(500).json(response);
}

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;
  const timestamp = new Date().toISOString();
  const path = req.originalUrl || req.url;

  const response: ErrorResponse = {
    error: 'NotFound',
    message: `Cannot ${req.method} ${path}`,
    status: 404,
    timestamp,
    path,
    requestId,
  };

  logger.warn('Route not found:', {
    method: req.method,
    path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
  });

  res.status(404).json(response);
};

// Async error wrapper for route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error factory functions
export const createAppError = (message: string, statusCode: number, details?: any): AppError => {
  return new ValidationError(message, details);
};

export const createValidationError = (message: string, details?: any): ValidationError => {
  return new ValidationError(message, details);
};

export const createAuthenticationError = (
  message: string = 'Authentication failed'
): AuthenticationError => {
  return new AuthenticationError(message);
};

export const createAuthorizationError = (
  message: string = 'Access forbidden'
): AuthorizationError => {
  return new AuthorizationError(message);
};

export const createNotFoundError = (resource: string = 'Resource'): NotFoundError => {
  return new NotFoundError(`${resource} not found`);
};

export const createRateLimitError = (message: string = 'Rate limit exceeded'): RateLimitError => {
  return new RateLimitError(message);
};
