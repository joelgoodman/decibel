import { Request, Response, NextFunction } from 'express';
import { ValidationError, BlockValidationError } from '../lib/validation/errors';
import { errorLogger } from '../lib/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  errorLogger.error(error, {
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  // Handle validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      details: error.details
    });
  }

  // Handle block-specific validation errors
  if (error instanceof BlockValidationError) {
    return res.status(400).json({
      error: error.message,
      blockId: error.blockId,
      details: error.details
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    return res.status(409).json({
      error: 'Resource already exists'
    });
  }

  if (error.message.includes('foreign key')) {
    return res.status(409).json({
      error: 'Referenced resource does not exist'
    });
  }

  // Default error response
  const statusCode = error.name === 'NotFoundError' ? 404 : 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    requestId: req.id // Added by Express for error tracking
  });
};