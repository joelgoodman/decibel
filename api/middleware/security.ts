import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { redis } from '../lib/redis';
import { toobusy } from '../lib/toobusy';

// Redis-based rate limiter store
const RedisStore = {
  async increment(key: string): Promise<{ totalHits: number, resetTime: number }> {
    const multi = redis.multi();
    const now = Date.now();
    const resetTime = now + (15 * 60 * 1000); // 15 minutes

    multi.zadd(key, now.toString(), now.toString());
    multi.zremrangebyscore(key, '-inf', (now - (15 * 60 * 1000)).toString());
    multi.zcard(key);
    multi.pexpire(key, 15 * 60 * 1000);

    const results = await multi.exec();
    return {
      totalHits: results ? Number(results[2][1]) : 0,
      resetTime
    };
  },

  async decrement(key: string): Promise<void> {
    const now = Date.now();
    await redis.zremrangebyscore(key, now.toString(), now.toString());
  },

  async resetKey(key: string): Promise<void> {
    await redis.del(key);
  }
};

// Rate limiting configuration
const createRateLimiter = (options: {
  windowMs?: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: options.message || 'Too many requests, please try again later' },
    keyGenerator: options.keyGenerator || ((req: Request) => {
      return req.ip || 
             req.headers['x-forwarded-for'] as string || 
             req.socket.remoteAddress || 
             'unknown';
    }),
    store: RedisStore
  });
};

// Different rate limiters for different endpoints
export const rateLimiters = {
  api: createRateLimiter({
    max: 100,
    message: 'Too many requests, please try again in 15 minutes'
  }),

  auth: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: 'Too many authentication attempts, please try again in 5 minutes'
  }),

  content: createRateLimiter({
    max: 50,
    message: 'Content creation limit reached, please try again in 15 minutes'
  }),

  user: (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next();

    return createRateLimiter({
      max: 200,
      keyGenerator: (req) => `user:${req.user!.id}`,
      message: 'Rate limit exceeded for your account'
    })(req, res, next);
  }
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  expectCt: {
    maxAge: 86400,
    enforce: true
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// Server load protection middleware
export const serverLoadProtection = (req: Request, res: Response, next: NextFunction) => {
  if (toobusy()) {
    res.status(503).json({ error: 'Server is too busy, please try again later' });
    return;
  }
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].toString().replace(/[<>]/g, '');
      }
    });
  }

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/[<>]/g, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }

  next();
};