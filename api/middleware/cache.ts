import { Request, Response, NextFunction } from 'express';
import { cacheService, createCacheKey } from '../lib/cache';

interface CacheOptions {
  ttl?: number;
  keyParams?: string[];
  condition?: (req: Request) => boolean;
}

export function cache(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache based on condition
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // Generate cache key
    const keyParts = [req.method, req.path];
    
    // Add query parameters to key if specified
    if (options.keyParams) {
      options.keyParams.forEach(param => {
        if (req.query[param]) {
          keyParts.push(`${param}:${req.query[param]}`);
        }
      });
    }

    // Add user ID for user-specific caching
    if (req.user) {
      keyParts.push(`user:${req.user.id}`);
    }

    const cacheKey = createCacheKey(keyParts);

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // If not in cache, capture the response
      const originalJson = res.json;
      res.json = function(body: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, options.ttl);
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // On cache error, continue without caching
      next();
    }
  };
}