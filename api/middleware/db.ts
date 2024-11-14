import { Request, Response, NextFunction } from 'express';
import { checkConnection } from '../lib/db';

export async function checkDatabaseConnection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const isConnected = await checkConnection();
    if (!isConnected) {
      return res.status(503).json({
        error: 'Database connection unavailable'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
}