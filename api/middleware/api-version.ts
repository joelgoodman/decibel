import { Request, Response, NextFunction } from 'express';

export function apiVersion(req: Request, res: Response, next: NextFunction) {
  // Add API version to response headers
  res.setHeader('X-API-Version', '1.0.0');
  
  // Add deprecation warning for old endpoints if needed
  if (req.path.startsWith('/api/v0')) {
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Sunset', '2024-12-31');
  }

  next();
}