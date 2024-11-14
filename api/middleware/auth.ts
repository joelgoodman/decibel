import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../lib/db';
import { rotateTokens } from '../services/auth';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

const tokenSchema = z.object({
  id: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET);
      const validated = tokenSchema.parse(decoded);

      const result = await query(
        `SELECT u.id, u.email, ARRAY_AGG(r.name) as roles
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.id = $1 AND u.deleted_at IS NULL
         GROUP BY u.id, u.email`,
        [validated.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      req.user = {
        id: user.id,
        email: user.email,
        roles: user.roles.filter(Boolean),
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Try to refresh the token
        const refreshToken = req.cookies.refresh_token;
        
        if (!refreshToken) {
          return res.status(401).json({ error: 'Token expired' });
        }

        const tokens = await rotateTokens(refreshToken, req.ip);
        
        if (!tokens) {
          return res.status(401).json({ error: 'Session expired' });
        }

        res.cookie('access_token', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000
        });

        res.cookie('refresh_token', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Retry authentication with new token
        const decoded = jwt.verify(tokens.accessToken, JWT_SECRET);
        const validated = tokenSchema.parse(decoded);

        const result = await query(
          `SELECT u.id, u.email, ARRAY_AGG(r.name) as roles
           FROM users u
           LEFT JOIN user_roles ur ON u.id = ur.user_id
           LEFT JOIN roles r ON ur.role_id = r.id
           WHERE u.id = $1 AND u.deleted_at IS NULL
           GROUP BY u.id, u.email`,
          [validated.id]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          roles: user.roles.filter(Boolean),
        };

        next();
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    next(error);
  }
};