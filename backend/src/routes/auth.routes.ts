import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE_NAME,
} from '../utils/auth';
import { authRateLimiter, requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const authRouter = Router();

// Safe user fields returned to the frontend (passwordHash is NEVER included)
const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  businessName: true,
  city: true,
  role: true,
  createdAt: true,
} as const;

// ============================================================
// Validation Schemas (Zod)
// ============================================================
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits').max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  businessName: z.string().trim().max(100).optional(),
  city: z.string().trim().max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  businessName: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
});

// Helper: issue Access + Refresh tokens, store hashed RefreshToken in PostgreSQL, set cookies
async function issueSession(
  user: { id: string; role: 'USER' | 'ADMIN' },
  res: Parameters<typeof setAuthCookies>[0]
): Promise<void> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
    },
  });

  setAuthCookies(res, accessToken, refreshToken);
}

// ============================================================
// POST /api/auth/register — Create a new user account
// ============================================================
authRouter.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await hashPassword(data.password);

    // SECURITY: Always force role='USER' on public signup (blocks privilege escalation)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName || null,
        city: data.city || null,
        passwordHash,
        role: 'USER',
      },
      select: safeUserSelect,
    });

    await issueSession(user, res);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/login — Verify password & set HttpOnly cookies
// ============================================================
authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const userRecord = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // SECURITY: Same generic message whether email doesn't exist OR password is wrong
    if (!userRecord) {
      throw new AppError('Invalid email or password.', 401);
    }

    const validPassword = await verifyPassword(data.password, userRecord.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone,
      businessName: userRecord.businessName,
      city: userRecord.city,
      role: userRecord.role,
      createdAt: userRecord.createdAt,
    };

    await issueSession(user, res);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/refresh — Rotate Refresh Token & issue new Access Token
// ============================================================
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

    if (!rawRefreshToken) {
      throw new AppError('Refresh token missing. Please log in again.', 401);
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      clearAuthCookies(res);
      throw new AppError('Refresh token expired or invalid. Please log in again.', 401);
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: safeUserSelect } },
    });

    if (
      !storedToken ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt < new Date() ||
      storedToken.userId !== payload.sub
    ) {
      clearAuthCookies(res);
      throw new AppError('Session revoked or expired. Please log in again.', 401);
    }

    // Revoke the used refresh token (Refresh Token Rotation!)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    await issueSession(storedToken.user, res);

    res.json({
      success: true,
      message: 'Session refreshed.',
      user: storedToken.user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/logout — Revoke DB Refresh Token & clear cookies
// ============================================================
authRouter.post('/logout', async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

    if (rawRefreshToken) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    clearAuthCookies(res);
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/auth/me — Get currently logged-in user (Protected!)
// ============================================================
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ============================================================
// PATCH /api/auth/me — Update current user's profile (Protected!)
// ============================================================
authRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.city !== undefined && { city: data.city }),
      },
      select: safeUserSelect,
    });

    res.json({
      success: true,
      message: 'Profile updated.',
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/auth/admin-check — Verifies Admin RBAC (ADMIN only!)
// ============================================================
authRouter.get('/admin-check', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome Admin ${req.user!.name}!`,
    role: req.user!.role,
  });
});
