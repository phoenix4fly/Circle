/** @type {import('next').NextConfig} */
const nextConfig = {
  // Убираем assetPrefix - он ломает деплой
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/webapp' : '',
  trailingSlash: true,
  
  // Базовые оптимизации
  poweredByHeader: false,
  compress: true,
  
  // Standalone mode для production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Оптимизация изображений
  images: {
    unoptimized: true,
  },

  // Оптимизация JS бандлов
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Webpack оптимизации
  webpack: (config, { dev }) => {
    // Исправляем проблемы с кешированием в dev режиме
    if (dev) {
      config.cache = false;
    }
    return config;
  },

  // SWC минификация включена по умолчанию в Next.js 15
}

module.exports = nextConfig 