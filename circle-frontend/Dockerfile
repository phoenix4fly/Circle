# Multi-stage build для Next.js
FROM node:18-alpine AS deps

# Устанавливаем зависимости для native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Копируем package files
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем node_modules из deps stage
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Собираем приложение
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Копируем build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на пользователя nextjs
USER nextjs

# Expose порт
EXPOSE 3000

# Настраиваем переменные окружения
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Запуск приложения
CMD ["node", "server.js"] 