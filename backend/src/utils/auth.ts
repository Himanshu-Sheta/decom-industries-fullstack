import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

const BCRYPT_ROUNDS = 12;

export interface JwtPayload {
  sub: string; // User ID
  role: Role;
}

// ============================================================
// 1. Password Hashing (One-way bcrypt with salt)
// ============================================================
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

// ============================================================
// 2. JWT Access & Refresh Tokens (Separate secrets!)
// ============================================================
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

// Hash refresh tokens with SHA-256 before saving to PostgreSQL
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================
// 3. Secure HttpOnly Cookies (Invisible to JS -> Blocks XSS!)
// ============================================================
export const ACCESS_COOKIE_NAME = 'decom_access_token';
export const REFRESH_COOKIE_NAME = 'decom_refresh_token';

const isProd = env.NODE_ENV === 'production';

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true, // Browser JS (document.cookie) CANNOT read this
    secure: isProd, // HTTPS only in production
    sameSite: 'lax', // Protects against CSRF
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/api/auth', // Sent ONLY to /api/auth endpoints
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE_NAME, { path: '/' });
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}
