import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { ValidationError } from '@/modules/shared/types/errors';
import { logger } from '@/modules/shared/utils/logger';

// Extend Express Request type to include file property
declare global {
  namespace Express {
    interface Request {
      file?: {
        filename: string;
        size: number;
        mimetype: string;
      };
    }
  }
}

export interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
  headers?: ZodSchema<any>;
}

/**
 * Validate request data against Zod schemas
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string; path: string[] }> = [];

      // Validate request body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: 'body',
                message: err.message,
                path: ['body', ...err.path.map(String)],
              }))
            );
          }
        }
      }

      // Validate query parameters
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: 'query',
                message: err.message,
                path: ['query', ...err.path.map(String)],
              }))
            );
          }
        }
      }

      // Validate URL parameters
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: 'params',
                message: err.message,
                path: ['params', ...err.path.map(String)],
              }))
            );
          }
        }
      }

      // Validate headers
      if (schemas.headers) {
        try {
          schemas.headers.parse(req.headers);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                field: 'headers',
                message: err.message,
                path: ['headers', ...err.path.map(String)],
              }))
            );
          }
        }
      }

      // If there are validation errors, throw ValidationError
      if (errors.length > 0) {
        logger.warn('Request validation failed', {
          errors,
          url: req.url,
          method: req.method,
          requestId: req.requestId,
        });

        throw new ValidationError('Request validation failed', { errors });
      }

      logger.debug('Request validation passed', {
        url: req.url,
        method: req.method,
        requestId: req.requestId,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate only request body
 */
export const validateBody = (schema: ZodSchema<any>) => {
  return validateRequest({ body: schema });
};

/**
 * Validate only query parameters
 */
export const validateQuery = (schema: ZodSchema<any>) => {
  return validateRequest({ query: schema });
};

/**
 * Validate only URL parameters
 */
export const validateParams = (schema: ZodSchema<any>) => {
  return validateRequest({ params: schema });
};

/**
 * Validate only headers
 */
export const validateHeaders = (schema: ZodSchema<any>) => {
  return validateRequest({ headers: schema });
};

/**
 * Sanitize HTML input to prevent XSS
 */
export const sanitizeHtml = (req: Request, res: Response, next: NextFunction): void => {
  // Simple HTML sanitization - in production, use a library like DOMPurify
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  next();
};

/**
 * Trim whitespace from string inputs
 */
export const trimStrings = (req: Request, res: Response, next: NextFunction): void => {
  const trimValue = (value: any): any => {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(trimValue);
      }
      const trimmed: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        trimmed[key] = trimValue(val);
      }
      return trimmed;
    }
    return value;
  };

  if (req.body) {
    req.body = trimValue(req.body);
  }

  if (req.query) {
    req.query = trimValue(req.query);
  }

  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page = '1', limit = '10', sortBy, sortOrder = 'asc' } = req.query;

  // Parse and validate page
  const pageNum = parseInt(page as string, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Invalid page number');
  }

  // Parse and validate limit
  const limitNum = parseInt(limit as string, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Invalid limit (must be between 1 and 100)');
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(sortOrder as string)) {
    throw new ValidationError('Invalid sort order (must be "asc" or "desc")');
  }

  // Set validated pagination in query
  req.query = {
    ...req.query,
    page: pageNum.toString(),
    limit: limitNum.toString(),
    sortBy: sortBy as string,
    sortOrder: sortOrder as string,
  };

  next();
};

/**
 * Validate file upload
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;

    // Check if file is required
    if (required && !req.file) {
      throw new ValidationError('File upload is required');
    }

    // If no file and not required, skip validation
    if (!req.file) {
      return next();
    }

    // Check file size
    if (req.file.size > maxSize) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      throw new ValidationError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    logger.debug('File upload validation passed', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      requestId: req.requestId,
    });

    next();
  };
};

/**
 * Validate JSON content type
 */
export const requireJson = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ValidationError('Content-Type must be application/json');
    }
  }
  next();
};

/**
 * Validate API version
 */
export const validateApiVersion = (supportedVersions: string[] = ['v1']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const version = (req.headers['api-version'] as string) || 'v1';

    if (!supportedVersions.includes(version)) {
      throw new ValidationError(
        `Unsupported API version. Supported versions: ${supportedVersions.join(', ')}`
      );
    }

    req.headers['api-version'] = version;
    next();
  };
};

/**
 * Validate request ID format
 */
export const validateRequestId = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;

  if (requestId) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      throw new ValidationError('Invalid request ID format (must be UUID)');
    }
  }

  next();
};
