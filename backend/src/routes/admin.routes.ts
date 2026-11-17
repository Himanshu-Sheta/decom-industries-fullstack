import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const adminRouter = Router();

// Every single route inside /api/admin requires a valid login AND ADMIN role!
adminRouter.use(requireAuth, requireRole('ADMIN'));

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// ============================================================
// GET /api/admin/stats — Live Executive Dashboard KPIs
// ============================================================
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      revenueAgg,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      totalUsers,
      newOemQuotes,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { grandTotalINR: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 25 } } }),
      prisma.user.count(),
      prisma.oemQuote.count({ where: { status: 'NEW' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, businessName: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenueINR: revenueAgg._sum.grandTotalINR ?? 0,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalUsers,
        newOemQuotes,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/admin/users — List all registered users (safe fields only!)
// ============================================================
adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        businessName: true,
        city: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, oemQuotes: true } },
      },
    });

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/users/:id/role — Promote or demote a user
// ============================================================
adminRouter.patch('/users/:id/role', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const { role } = updateRoleSchema.parse(req.body);

    if (id === req.user!.id && role !== 'ADMIN') {
      throw new AppError('You cannot remove your own ADMIN role.', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.json({
      success: true,
      message: `Updated ${updated.email} role to ${updated.role}.`,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});
