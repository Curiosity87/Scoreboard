# Multi-stage build för Next.js (standalone) + Prisma.
# Körs t.ex. i en Proxmox LXC bakom Caddy/nginx som sköter TLS.

FROM node:22-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

# --- Beroenden ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# --- Bygg ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate && pnpm build

# --- Runtime ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma CLI + schema/migrationer så att "migrate deploy" kan köras vid start.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# Kör migrationer och starta appen.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
