import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

/**
 * Custom operational error class with an HTTP status code.
 * Example: throw new AppError('Invalid email or password', 401);
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod input validation errors -> 400 Bad Request
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // 2. Known application errors (401 Unauthorized, 403 Forbidden, 404, 409, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 3. Unexpected server errors -> NEVER leak internal stack traces in production!
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'development' && err instanceof Error
        ? err.message
        : 'Internal server error',
  });
}
