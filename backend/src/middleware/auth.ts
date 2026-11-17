import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import type { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ACCESS_COOKIE_NAME, verifyAccessToken } from '../utils/auth';
import { AppError } from './errorHandler';

// Stricter rate limit for login/register to stop password brute-force attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 auth attempts per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

/**
 * Auth Guard: verifies JWT from HttpOnly cookie (or Bearer header)
 * and loads the current user onto req.user.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    const token = cookieToken || bearerToken;

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError('Session expired or invalid token. Please log in again.', 401);
    }

    // Fetch fresh user from DB (NEVER select passwordHash!)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessName: true,
        city: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User account no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role Guard (RBAC): restricts a route to specific roles (e.g., ADMIN).
 * Must always be placed AFTER requireAuth!
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          'Forbidden: you do not have permission to access this resource.',
          403
        )
      );
      return;
    }

    next();
  };
}
