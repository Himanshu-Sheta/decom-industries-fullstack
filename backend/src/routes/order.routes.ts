import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const orderRouter = Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(10000),
      })
    )
    .min(1, 'Order must contain at least one item'),
  shippingAddress: z.string().trim().min(5, 'Shipping address is required').max(300),
  city: z.string().trim().min(2, 'City is required').max(100),
  phone: z.string().trim().min(8, 'Valid phone number is required').max(20),
  notes: z.string().trim().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

function generateOrderNumber(): string {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `DCM-${year}-${randomPart}`;
}

// ============================================================
// POST /api/orders — Place order (Logged-in Users)
// SECURITY: Prices & 18% GST are calculated STRICTLY on the server!
// ============================================================
orderRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Combine duplicate productIds if the client sent any
    const qtyByProduct = new Map<string, number>();
    for (const item of data.items) {
      qtyByProduct.set(
        item.productId,
        (qtyByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }

    const productIds = Array.from(qtyByProduct.keys());

    // Atomic PostgreSQL transaction: verify stock, compute totals, decrement stock, create order
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new AppError('One or more products are unavailable.', 400);
      }

      let subtotalINR = 0;
      const lineItems: {
        productId: string;
        quantity: number;
        unitPriceINR: number;
        lineTotalINR: number;
      }[] = [];

      for (const product of products) {
        const quantity = qtyByProduct.get(product.id)!;
        if (product.stock < quantity) {
          throw new AppError(
            `Insufficient stock for "${product.name}" (available: ${product.stock}).`,
            400
          );
        }

        const unitPriceINR = product.priceINR;
        const lineTotalINR = unitPriceINR * quantity;
        subtotalINR += lineTotalINR;

        lineItems.push({
          productId: product.id,
          quantity,
          unitPriceINR,
          lineTotalINR,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      const gstINR = Math.round(subtotalINR * 0.18);
      const grandTotalINR = subtotalINR + gstINR;

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user!.id,
          subtotalINR,
          gstINR,
          grandTotalINR,
          shippingAddress: data.shippingAddress,
          city: data.city,
          phone: data.phone,
          notes: data.notes || null,
          items: { create: lineItems },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true, imageUrl: true } },
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/orders/mine — Customer sees ONLY their own orders (IDOR safe!)
// ============================================================
orderRouter.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, imageUrl: true } },
          },
        },
      },
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/orders — All orders across all customers (ADMIN ONLY)
// ============================================================
orderRouter.get('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const statusParam =
      typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;

    const validStatus =
      statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;

    const orders = await prisma.order.findMany({
      where: validStatus ? { status: validStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, businessName: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, imageUrl: true } },
          },
        },
      },
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/orders/:id/status — Update fulfillment status (ADMIN ONLY)
// ============================================================
orderRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const { status } = updateStatusSchema.parse(req.body);

      const existing = await prisma.order.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!existing) {
        throw new AppError('Order not found.', 404);
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
      });

      res.json({
        success: true,
        message: `Order status updated to ${status}.`,
        order,
      });
    } catch (err) {
      next(err);
    }
  }
);
