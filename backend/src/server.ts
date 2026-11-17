import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 Decom Industries API running at http://localhost:${env.PORT}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`🔒 CORS allowed origin: ${env.FRONTEND_URL}\n`);
});

// Graceful shutdown: close HTTP server & database connections cleanly on Ctrl+C
async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down cleanly...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
