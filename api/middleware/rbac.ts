import { Response, NextFunction } from 'express';
import { query } from '../lib/db';
import type { AuthRequest } from './auth';

export const checkPermission = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await query(
        `SELECT permissions
         FROM roles
         WHERE name = ANY($1)`,
        [req.user.roles]
      );

      const hasPermission = result.rows.some(role => 
        role.permissions.includes('*') || role.permissions.includes(requiredPermission)
      );

      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};