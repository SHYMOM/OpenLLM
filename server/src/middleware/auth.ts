import type { Request, Response, NextFunction } from 'express';
import { getAdminPassword } from '../db/index.js';

/**
 * Middleware to protect /api routes if ADMIN_PASSWORD is set.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const adminPassword = getAdminPassword();

  // If no password is set, the dashboard is unprotected
  if (!adminPassword || adminPassword.trim() === '') {
    return next();
  }

  // Verify Bearer token
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (token === adminPassword) {
    return next();
  }

  res.status(401).json({
    error: {
      message: 'Authentication required for this operation.',
      type: 'authentication_error',
    },
  });
}
