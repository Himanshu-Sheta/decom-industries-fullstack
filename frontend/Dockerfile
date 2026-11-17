# ============================================================
# Stage 1: Build Next.js Production Bundle
# ============================================================
FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars are baked into client JS at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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
