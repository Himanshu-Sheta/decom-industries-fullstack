import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { orderRouter } from './routes/order.routes';
import { oemRouter } from './routes/oem.routes';
import { adminRouter } from './routes/admin.routes';
import { uploadRouter, UPLOADS_ROOT } from './routes/upload.routes';

export const app = express();

// ============================================================
// 5-Layer Security Shield (runs BEFORE every route!)
// ============================================================

// 1. Helmet: sets secure HTTP headers (allow cross-origin <img> loading for /uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS: ONLY our Frontend URL can call this API & send HttpOnly auth cookies
const allowedOrigins = new Set([
  env.FRONTEND_URL,
  ...(env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Rate Limiting: protects against DDoS/spam while keeping Admin & browsing smooth
// (Strict 15 req/15m brute-force limit stays on /api/auth/login & /register!)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 5000 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// 4. Body size limit: blocks giant JSON payload attacks
app.use(express.json({ limit: '100kb' }));

// 5. Cookie parser: reads HttpOnly authentication cookies safely
app.use(cookieParser());

// Static uploaded product images (safe read-only serving with cache)
app.use(
  '/uploads',
  express.static(UPLOADS_ROOT, {
    maxAge: '7d',
    index: false,
    dotfiles: 'deny',
  })
);

// ============================================================
// Health Check Route — verifies Express + Docker PostgreSQL!
// ============================================================
app.get('/api/health', async (_req, res, next) => {
  try {
    // Run a lightweight SQL query to prove PostgreSQL inside Docker is reachable
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      service: 'decom-industries-api',
      environment: env.NODE_ENV,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/oem-quotes', oemRouter);
app.use('/api/admin', adminRouter);
app.use('/api/uploads', uploadRouter);

// ============================================================
// Fallback 404 & Centralized Error Handler (must be LAST)
// ============================================================
app.use(notFoundHandler);
app.use(errorHandler);
