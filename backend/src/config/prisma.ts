import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Single shared Prisma connection pool for the entire API server
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
