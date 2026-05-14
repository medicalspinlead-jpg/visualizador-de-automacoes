# Usar Node.js 22 Alpine como base
FROM node:22-alpine AS base

# Instalar dependencias necessarias
RUN apk add --no-cache libc6-compat openssl

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ========================================
# Etapa de dependencias
# ========================================
FROM base AS deps

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --legacy-peer-deps

# ========================================
# Etapa de build
# ========================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar o Prisma Client
RUN pnpm prisma generate

# Build da aplicacao Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ========================================
# Etapa de producao
# ========================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuario nao-root para seguranca
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos publicos
COPY --from=builder /app/public ./public

# Copiar o build do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar arquivos do Prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
