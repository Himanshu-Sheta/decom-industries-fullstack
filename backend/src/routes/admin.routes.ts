import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { hashPassword } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

export const adminRouter = Router();

// Every single route inside /api/admin requires a valid login AND ADMIN role!
adminRouter.use(requireAuth, requireRole('ADMIN'));

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(8).max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72)
    .regex(/[A-Za-z]/, 'Password must include a letter')
    .regex(/[0-9]/, 'Password must include a number'),
  businessName: z.string().trim().max(100).optional(),
  city: z.string().trim().max(80).optional(),
  role: z.nativeEnum(Role).default('USER'),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(8).max(20).optional(),
  businessName: z.string().trim().max(100).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  role: z.nativeEnum(Role).optional(),
});

// ============================================================
// GET /api/admin/stats — Live Executive Analytics & KPIs
// ============================================================
adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [
      revenueAgg,
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockList,
      totalUsers,
      newOemQuotes,
      recentOrders,
      ordersByStatusRaw,
      orderItemsForCategory,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { grandTotalINR: true, gstINR: true, subtotalINR: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 50 } },
        orderBy: { stock: 'asc' },
        take: 6,
        select: { id: true, name: true, sku: true, stock: true, imageUrl: true, priceINR: true },
      }),
      prisma.user.count(),
      prisma.oemQuote.count({ where: { status: 'NEW' } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, businessName: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, imageUrl: true } },
            },
          },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: { not: 'CANCELLED' } } },
        select: {
          lineTotalINR: true,
          quantity: true,
          product: { select: { category: true } },
        },
      }),
    ]);

    const ordersByStatus: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      IN_PRODUCTION: 0,
      READY_FOR_PICKUP: 0,
      PICKED_UP: 0,
      DISPATCHED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    for (const row of ordersByStatusRaw) {
      ordersByStatus[row.status] = row._count._all;
    }

    const categoryMap = new Map<string, { revenueINR: number; units: number }>();
    for (const item of orderItemsForCategory) {
      const cat = item.product.category;
      const prev = categoryMap.get(cat) ?? { revenueINR: 0, units: 0 };
      categoryMap.set(cat, {
        revenueINR: prev.revenueINR + item.lineTotalINR,
        units: prev.units + item.quantity,
      });
    }

    const revenueByCategory = Array.from(categoryMap.entries())
      .map(([category, vals]) => ({ category, ...vals }))
      .sort((a, b) => b.revenueINR - a.revenueINR);

    res.json({
      success: true,
      stats: {
        totalRevenueINR: revenueAgg._sum.grandTotalINR ?? 0,
        totalGstINR: revenueAgg._sum.gstINR ?? 0,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts: lowStockList.length,
        totalUsers,
        newOemQuotes,
        ordersByStatus,
        revenueByCategory,
        lowStockList,
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
// POST /api/admin/users — Create a new User or Admin directly
// ============================================================
adminRouter.post('/users', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      throw new AppError('A user with this email already exists.', 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName || null,
        city: data.city || null,
        passwordHash,
        role: data.role,
      },
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

    res.status(201).json({
      success: true,
      message: `Created ${user.role} account for ${user.email}.`,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/users/:id — Update user details & role
// ============================================================
adminRouter.patch('/users/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const data = updateUserSchema.parse(req.body);

    if (id === req.user!.id && data.role && data.role !== 'ADMIN') {
      throw new AppError('You cannot remove your own ADMIN role.', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.role !== undefined && { role: data.role }),
      },
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

    res.json({
      success: true,
      message: `Updated ${updated.name}.`,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/users/:id/role — Quick role toggle
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

// ============================================================
// DELETE /api/admin/users/:id — Safely delete user (if no orders)
// ============================================================
adminRouter.delete('/users/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);

    if (id === req.user!.id) {
      throw new AppError('You cannot delete your own logged-in admin account.', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!existing) {
      throw new AppError('User not found.', 404);
    }

    if (existing._count.orders > 0) {
      throw new AppError(
        `Cannot delete ${existing.email} because they have ${existing._count.orders} order(s) in accounting history.`,
        409
      );
    }

    await prisma.user.delete({ where: { id } });
    res.json({
      success: true,
      message: `Deleted user ${existing.email}.`,
    });
  } catch (err) {
    next(err);
  }
});
