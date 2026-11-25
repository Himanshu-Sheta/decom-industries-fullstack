# ============================================================
# Stage 1: Build Next.js Production Bundle
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Baked into Next.js client bundle & rewrite manifest at build time
ARG NEXT_PUBLIC_API_URL=/api
ARG BACKEND_INTERNAL_URL=http://backend:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================
# Stage 2: Lightweight Next.js Runtime (Non-Root User)
# ============================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Security: run container as non-root `node` user
USER node

EXPOSE 3000

CMD ["npm", "run", "start"]
