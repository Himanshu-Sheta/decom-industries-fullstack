import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { QuoteStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ACCESS_COOKIE_NAME, verifyAccessToken } from '../utils/auth';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const oemRouter = Router();

const createOemQuoteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(8).max(20),
  businessName: z.string().trim().max(120).optional(),
  productType: z.string().trim().min(2).max(100),
  materialMicron: z.string().trim().min(2).max(80),
  customSize: z.string().trim().min(2).max(100),
  quantity: z.coerce.number().int().min(50, 'Minimum OEM quantity is 50 units').max(1000000),
  logoPrinting: z.boolean().optional().default(false),
  notes: z.string().trim().max(1000).optional(),
});

const updateQuoteStatusSchema = z.object({
  status: z.nativeEnum(QuoteStatus),
});

function generateQuoteNumber(): string {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `OEM-${new Date().getFullYear()}-${randomPart}`;
}

// ============================================================
// POST /api/oem-quotes — Submit Custom OEM Inquiry (Public or Logged-in)
// ============================================================
oemRouter.post('/', async (req, res, next) => {
  try {
    const data = createOemQuoteSchema.parse(req.body);

    // Optional: link quote to logged-in user if valid cookie is present
    let userId: string | null = null;
    const token = req.cookies?.[ACCESS_COOKIE_NAME] as string | undefined;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        userId = payload.sub;
      } catch {
        // Ignore expired cookie on public OEM form
      }
    }

    const quote = await prisma.oemQuote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName || null,
        productType: data.productType,
        materialMicron: data.materialMicron,
        customSize: data.customSize,
        quantity: data.quantity,
        logoPrinting: data.logoPrinting,
        notes: data.notes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Custom OEM quote request submitted.',
      quote,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/oem-quotes/mine — Logged-in user's OEM quotes
// ============================================================
oemRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const quotes = await prisma.oemQuote.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: quotes.length, quotes });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/oem-quotes — All OEM inquiries (ADMIN ONLY)
// ============================================================
oemRouter.get('/', requireAuth, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const quotes = await prisma.oemQuote.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: quotes.length, quotes });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/oem-quotes/:id/status — Update OEM quote status (ADMIN ONLY)
// ============================================================
oemRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const { status } = updateQuoteStatusSchema.parse(req.body);

      const existing = await prisma.oemQuote.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) {
        throw new AppError('OEM quote not found.', 404);
      }

      const quote = await prisma.oemQuote.update({
        where: { id },
        data: { status },
      });

      res.json({
        success: true,
        message: `Quote status updated to ${status}.`,
        quote,
      });
    } catch (err) {
      next(err);
    }
  }
);
