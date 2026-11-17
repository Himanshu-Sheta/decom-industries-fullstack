# ============================================================
# Stage 1: Build TypeScript & Generate Prisma Client
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ============================================================
# Stage 2: Lightweight Production Runtime (Non-Root User)
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Security: run container as non-root `node` user
USER node

EXPOSE 4000

# Apply pending Prisma migrations on startup, then launch compiled API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
