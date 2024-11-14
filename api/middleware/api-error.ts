import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../lib/validation/errors';
import { logger } from '../lib/logger';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
  requestId?: string;
}

export function apiErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id;
  logger.error({ error, requestId });

  const apiError: ApiError = {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    requestId
  };

  // Handle known error types
  if (error instanceof ValidationError) {
    apiError.status = 400;
    apiError.code = 'VALIDATION_ERROR';
    apiError.message = error.message;
    apiError.details = error.details;
  } else if (error.name === 'UnauthorizedError') {
    apiError.status = 401;
    apiError.code = 'UNAUTHORIZED';
    apiError.message = 'Authentication required';
  } else if (error.name === 'ForbiddenError') {
    apiError.status = 403;
    apiError.code = 'FORBIDDEN';
    apiError.message = 'Insufficient permissions';
  } else if (error.name === 'NotFoundError') {
    apiError.status = 404;
    apiError.code = 'NOT_FOUND';
    apiError.message = 'Resource not found';
  }

  // Only show error details in development
  if (process.env.NODE_ENV === 'production') {
    delete apiError.details;
  }

  res.status(apiError.status).json({ error: apiError });
}