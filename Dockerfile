# 1. Base Image
FROM node:18-alpine AS base

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time for Next.js to bake them in?
# Actually, for runtime envs (like DB), we rely on runtime injection.
# But for NEXT_PUBLIC_..., they are baked in.
# We assume envs are provided via build-args or .env.production
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
