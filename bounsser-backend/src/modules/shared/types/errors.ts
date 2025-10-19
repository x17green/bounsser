/**
 * Custom error classes for Bouncer application
 * Provides type-safe error handling with consistent structure
 */

export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: number, details?: any, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error - 400 Bad Request
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, details);
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * Used when authentication is required but not provided or invalid
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Authorization Error - 403 Forbidden
 * Used when user is authenticated but lacks permission
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error - 404 Not Found
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error - 409 Conflict
 * Used for resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 409, details);
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, { retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal Server Error - 500 Internal Server Error
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, details, false); // Not operational as it's unexpected
  }
}

/**
 * Service Unavailable Error - 503 Service Unavailable
 * Used when external services are unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503);
  }
}

/**
 * Bad Gateway Error - 502 Bad Gateway
 * Used when external service returns invalid response
 */
export class BadGatewayError extends AppError {
  constructor(message: string = 'Bad gateway', details?: any) {
    super(message, 502, details);
  }
}

/**
 * Gateway Timeout Error - 504 Gateway Timeout
 * Used when external service times out
 */
export class GatewayTimeoutError extends AppError {
  constructor(message: string = 'Gateway timeout') {
    super(message, 504);
  }
}

// Twitter API specific errors
export class TwitterAPIError extends AppError {
  public readonly twitterCode?: string;
  public readonly twitterMessage?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    twitterCode?: string,
    twitterMessage?: string,
    details?: any
  ) {
    super(message, statusCode, { twitterCode, twitterMessage, ...details });
    this.twitterCode = twitterCode;
    this.twitterMessage = twitterMessage;
  }
}

/**
 * Database Error
 * Used for database operation failures
 */
export class DatabaseError extends AppError {
  public readonly operation?: string;
  public readonly table?: string;

  constructor(
    message: string = 'Database operation failed',
    operation?: string,
    table?: string,
    details?: any
  ) {
    super(message, 500, { operation, table, ...details }, false);
    this.operation = operation;
    this.table = table;
  }
}

/**
 * Queue Error
 * Used for message queue operation failures
 */
export class QueueError extends AppError {
  public readonly queueName?: string;
  public readonly jobId?: string;

  constructor(
    message: string = 'Queue operation failed',
    queueName?: string,
    jobId?: string,
    details?: any
  ) {
    super(message, 500, { queueName, jobId, ...details }, false);
    this.queueName = queueName;
    this.jobId = jobId;
  }
}

/**
 * External Service Error
 * Used for external service integration failures
 */
export class ExternalServiceError extends AppError {
  public readonly service?: string;
  public readonly endpoint?: string;

  constructor(
    message: string = 'External service error',
    statusCode: number = 502,
    service?: string,
    endpoint?: string,
    details?: any
  ) {
    super(message, statusCode, { service, endpoint, ...details });
    this.service = service;
    this.endpoint = endpoint;
  }
}

/**
 * File Processing Error
 * Used for file upload/processing failures
 */
export class FileProcessingError extends AppError {
  public readonly fileName?: string;
  public readonly fileType?: string;

  constructor(
    message: string = 'File processing failed',
    fileName?: string,
    fileType?: string,
    details?: any
  ) {
    super(message, 422, { fileName, fileType, ...details });
    this.fileName = fileName;
    this.fileType = fileType;
  }
}

/**
 * Impersonation Detection Errors
 */
export class DetectionError extends AppError {
  public readonly detectionType?: string;
  public readonly suspectId?: string;
  public readonly targetId?: string;

  constructor(
    message: string = 'Detection process failed',
    detectionType?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) {
    super(message, 500, { detectionType, suspectId, targetId, ...details }, false);
    this.detectionType = detectionType;
    this.suspectId = suspectId;
    this.targetId = targetId;
  }
}

/**
 * Feature Extraction Error
 * Used when feature extraction fails
 */
export class FeatureExtractionError extends DetectionError {
  public readonly featureType?: string;

  constructor(
    message: string = 'Feature extraction failed',
    featureType?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) {
    super(message, featureType, suspectId, targetId, { featureType, ...details });
    this.featureType = featureType;
  }
}

/**
 * Scoring Error
 * Used when scoring calculation fails
 */
export class ScoringError extends DetectionError {
  public readonly scoringModel?: string;

  constructor(
    message: string = 'Scoring calculation failed',
    scoringModel?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) {
    super(message, 'scoring', suspectId, targetId, { scoringModel, ...details });
    this.scoringModel = scoringModel;
  }
}

/**
 * Notification Error
 * Used when notification delivery fails
 */
export class NotificationError extends AppError {
  public readonly notificationType?: string;
  public readonly recipient?: string;
  public readonly channel?: string;

  constructor(
    message: string = 'Notification delivery failed',
    notificationType?: string,
    recipient?: string,
    channel?: string,
    details?: any
  ) {
    super(message, 500, { notificationType, recipient, channel, ...details });
    this.notificationType = notificationType;
    this.recipient = recipient;
    this.channel = channel;
  }
}

// Error type guards
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: any): boolean => {
  return isAppError(error) && error.isOperational;
};

export const isTwitterAPIError = (error: any): error is TwitterAPIError => {
  return error instanceof TwitterAPIError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isQueueError = (error: any): error is QueueError => {
  return error instanceof QueueError;
};

export const isDetectionError = (error: any): error is DetectionError => {
  return error instanceof DetectionError;
};

export const isNotificationError = (error: any): error is NotificationError => {
  return error instanceof NotificationError;
};

// Error response type for API responses
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

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const getErrorCode = (error: unknown): string => {
  if (isAppError(error)) {
    return error.name;
  }
  if (error instanceof Error) {
    return error.name;
  }
  return 'UnknownError';
};

export const getStatusCode = (error: unknown): number => {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
};

// Error creation helpers
export const createError = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  authentication: (message?: string) => new AuthenticationError(message),
  authorization: (message?: string) => new AuthorizationError(message),
  notFound: (resource?: string) =>
    new NotFoundError(resource ? `${resource} not found` : undefined),
  conflict: (message: string, details?: any) => new ConflictError(message, details),
  rateLimit: (message?: string, retryAfter?: number) => new RateLimitError(message, retryAfter),
  internal: (message?: string, details?: any) => new InternalServerError(message, details),
  serviceUnavailable: (message?: string) => new ServiceUnavailableError(message),
  badGateway: (message?: string, details?: any) => new BadGatewayError(message, details),
  gatewayTimeout: (message?: string) => new GatewayTimeoutError(message),
  twitter: (
    message: string,
    statusCode?: number,
    twitterCode?: string,
    twitterMessage?: string,
    details?: any
  ) => new TwitterAPIError(message, statusCode, twitterCode, twitterMessage, details),
  database: (message?: string, operation?: string, table?: string, details?: any) =>
    new DatabaseError(message, operation, table, details),
  queue: (message?: string, queueName?: string, jobId?: string, details?: any) =>
    new QueueError(message, queueName, jobId, details),
  externalService: (
    message?: string,
    statusCode?: number,
    service?: string,
    endpoint?: string,
    details?: any
  ) => new ExternalServiceError(message, statusCode, service, endpoint, details),
  fileProcessing: (message?: string, fileName?: string, fileType?: string, details?: any) =>
    new FileProcessingError(message, fileName, fileType, details),
  detection: (
    message?: string,
    detectionType?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) => new DetectionError(message, detectionType, suspectId, targetId, details),
  featureExtraction: (
    message?: string,
    featureType?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) => new FeatureExtractionError(message, featureType, suspectId, targetId, details),
  scoring: (
    message?: string,
    scoringModel?: string,
    suspectId?: string,
    targetId?: string,
    details?: any
  ) => new ScoringError(message, scoringModel, suspectId, targetId, details),
  notification: (
    message?: string,
    notificationType?: string,
    recipient?: string,
    channel?: string,
    details?: any
  ) => new NotificationError(message, notificationType, recipient, channel, details),
};
