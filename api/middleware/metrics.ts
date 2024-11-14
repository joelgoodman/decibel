import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import {
  requestCounter,
  requestDuration,
  dbQueryCounter,
  dbQueryDuration
} from '../lib/observability';
import { logger } from '../lib/logger';

// Request metrics middleware
export function requestMetrics(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  const path = req.route ? req.route.path : req.path;

  // Increment request counter
  requestCounter.add(1, {
    method: req.method,
    path,
    route: req.route?.path || 'unknown'
  });

  // Track response
  res.on('finish', () => {
    const duration = performance.now() - start;
    
    requestDuration.record(duration, {
      method: req.method,
      path,
      status: res.statusCode.toString()
    });

    // Log request details
    logger.info({
      type: 'request',
      method: req.method,
      path,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });

  next();
}

// Database metrics middleware
export function databaseMetrics(req: Request, res: Response, next: NextFunction) {
  const queryStart = performance.now();

  // Wrap the query execution
  const originalQuery = req.db?.query;
  if (originalQuery) {
    req.db.query = async (...args: any[]) => {
      try {
        dbQueryCounter.add(1);
        const result = await originalQuery.apply(req.db, args);
        const duration = performance.now() - queryStart;
        
        dbQueryDuration.record(duration, {
          query: args[0].split(' ')[0] // First word of query for categorization
        });

        return result;
      } catch (error) {
        logger.error({
          type: 'database_error',
          query: args[0],
          error: error.message
        });
        throw error;
      }
    };
  }

  next();
}