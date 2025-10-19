import { randomUUID } from 'crypto';

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request ID already exists in headers
  const existingRequestId = req.get('x-request-id') || req.get('x-correlation-id');

  // Generate new request ID if none exists
  const requestId = existingRequestId || randomUUID();

  // Add request ID to request object
  req.requestId = requestId;

  // Add request ID to response headers
  res.set('x-request-id', requestId);

  next();
};
