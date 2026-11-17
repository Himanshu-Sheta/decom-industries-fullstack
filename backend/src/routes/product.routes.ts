import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const productRouter = Router();

const createProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  sku: z.string().trim().min(3).max(40),
  name: z.string().trim().min(3).max(140),
  category: z.string().trim().min(2).max(60),
  tagline: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  materialSpec: z.string().trim().min(2).max(160),
  dimensions: z.string().trim().min(2).max(100),
  moq: z.coerce.number().int().min(1).default(1),
  priceINR: z.coerce.number().int().min(1),
  samplePriceINR: z.coerce.number().int().min(1),
  stock: z.coerce.number().int().min(0).default(100),
  imageUrl: z.string().trim().min(1).max(500),
  galleryUrls: z
    .array(z.string().trim().min(1).max(500))
    .max(12, 'Maximum 12 photos per product')
    .optional()
    .default([]),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

const updateProductSchema = createProductSchema.partial();

function normalizeGallery(imageUrl: string, galleryUrls?: string[]): string[] {
  const unique = new Set<string>([imageUrl]);
  for (const url of galleryUrls ?? []) {
    if (url.trim()) unique.add(url.trim());
  }
  return Array.from(unique).slice(0, 12);
}

// ============================================================
// GET /api/products — Public catalog with search & category filter
// ============================================================
productRouter.get('/', async (req, res, next) => {
  try {
    const category =
      typeof req.query.category === 'string' ? req.query.category.trim() : undefined;
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
    const featured = req.query.featured === 'true';

    const where = {
      isActive: true,
      ...(category && category !== 'All' ? { category } : {}),
      ...(featured ? { isFeatured: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { tagline: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { materialSpec: { contains: search, mode: 'insensitive' as const } },
              { sku: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [products, categoriesRaw] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ]);

    res.json({
      success: true,
      count: products.length,
      categories: categoriesRaw.map((c) => c.category),
      products,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/products/admin/all — Admin sees ALL products (including inactive)
// ============================================================
productRouter.get(
  '/admin/all',
  requireAuth,
  requireRole('ADMIN'),
  async (_req, res, next) => {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, count: products.length, products });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// GET /api/products/:slugOrId — Single product detail
// ============================================================
productRouter.get('/:slugOrId', async (req, res, next) => {
  try {
    const slugOrId = String(req.params.slugOrId);
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
        isActive: true,
      },
    });

    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/products — Create product (ADMIN ONLY)
// ============================================================
productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const data = createProductSchema.parse(req.body);

      const duplicate = await prisma.product.findFirst({
        where: { OR: [{ slug: data.slug }, { sku: data.sku }] },
        select: { id: true },
      });
      if (duplicate) {
        throw new AppError('A product with this slug or SKU already exists.', 409);
      }

      const galleryUrls = normalizeGallery(data.imageUrl, data.galleryUrls);
      const product = await prisma.product.create({
        data: {
          ...data,
          imageUrl: galleryUrls[0],
          galleryUrls,
        },
      });
      res.status(201).json({
        success: true,
        message: 'Product created.',
        product,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// PATCH /api/products/:id — Update product (ADMIN ONLY)
// ============================================================
productRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const data = updateProductSchema.parse(req.body);

      const existing = await prisma.product.findUnique({
        where: { id },
        select: { id: true, imageUrl: true, galleryUrls: true },
      });
      if (!existing) {
        throw new AppError('Product not found.', 404);
      }

      // Check slug/SKU uniqueness against other products
      if (data.slug || data.sku) {
        const orChecks = [
          ...(data.slug ? [{ slug: data.slug }] : []),
          ...(data.sku ? [{ sku: data.sku }] : []),
        ];
        const collision = await prisma.product.findFirst({
          where: { id: { not: id }, OR: orChecks },
          select: { id: true },
        });
        if (collision) {
          throw new AppError('Another product already uses this slug or SKU.', 409);
        }
      }

      const nextImageUrl = data.imageUrl ?? existing.imageUrl;
      const nextGalleryUrls =
        data.galleryUrls !== undefined
          ? normalizeGallery(nextImageUrl, data.galleryUrls)
          : data.imageUrl !== undefined
            ? normalizeGallery(nextImageUrl, existing.galleryUrls)
            : undefined;

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...data,
          ...(nextGalleryUrls !== undefined && {
            imageUrl: nextGalleryUrls[0],
            galleryUrls: nextGalleryUrls,
          }),
        },
      });

      res.json({
        success: true,
        message: 'Product updated.',
        product,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// DELETE /api/products/:id — Delete or archive product (ADMIN ONLY)
// ============================================================
productRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const id = String(req.params.id);
      const existing = await prisma.product.findUnique({
        where: { id },
        include: { _count: { select: { orderItems: true } } },
      });

      if (!existing) {
        throw new AppError('Product not found.', 404);
      }

      // If this product is in historical orders, archive it instead of breaking invoices!
      if (existing._count.orderItems > 0) {
        await prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
        res.json({
          success: true,
          message: 'Product archived (it belongs to existing orders).',
        });
        return;
      }

      await prisma.product.delete({ where: { id } });
      res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
      next(err);
    }
  }
);
