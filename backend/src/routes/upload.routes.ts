import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import express, { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const uploadRouter = Router();

export const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');
const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'products');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB max

/**
 * Security: verify the actual binary file signature (magic bytes),
 * NOT just the filename or Content-Type header!
 */
function detectImageExtension(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }
  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

// ============================================================
// POST /api/uploads/product-image (ADMIN ONLY)
// Accepts binary image body (JPEG, PNG, WebP up to 5 MB)
// Saves to backend/uploads/products/<random-id>.<ext>
// Returns permanent URL to store in PostgreSQL Product.imageUrl
// ============================================================
uploadRouter.post(
  '/product-image',
  requireAuth,
  requireRole('ADMIN'),
  express.raw({ type: ALLOWED_TYPES, limit: MAX_BYTES }),
  async (req, res, next) => {
    try {
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        throw new AppError(
          'Please upload a valid JPEG, PNG, or WebP image (max 5 MB).',
          400
        );
      }

      const ext = detectImageExtension(req.body);
      if (!ext) {
        throw new AppError(
          'Invalid image file. Only genuine JPEG, PNG, and WebP images are allowed.',
          400
        );
      }

      await fs.mkdir(PRODUCT_UPLOADS_DIR, { recursive: true });

      // Cryptographically random filename prevents overwrites & path traversal
      const filename = `product-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const destination = path.join(PRODUCT_UPLOADS_DIR, filename);

      await fs.writeFile(destination, req.body);

      const protocol = req.protocol;
      const host = req.get('host');
      const publicUrl = `${protocol}://${host}/uploads/products/${filename}`;

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        filename,
        sizeBytes: req.body.length,
        imageUrl: publicUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);
