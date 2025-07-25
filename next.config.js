/** @type {import('next').NextConfig} */
const nextConfig = {
  // Настройки для Telegram WebApp
  assetPrefix: process.env.NODE_ENV === 'production' ? '/webapp' : '',
  trailingSlash: true,
  
  // Standalone mode для Docker
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Базовые оптимизации
  poweredByHeader: false,
  compress: true,
  
  // Оптимизация изображений
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Оптимизация JS бандлов
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack оптимизации
  webpack: (config, { dev, buildId, isServer }) => {
    // Исправляем проблемы с кешированием в dev режиме
    if (dev) {
      config.cache = false;
    }

    // Production оптимизации
    if (!dev) {
      // Оптимизация chunk splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 10,
            chunks: 'all',
          },
          heroicons: {
            test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
            name: 'heroicons',
            priority: 5,
            chunks: 'all',
          },
        },
      };

      // Минимизация и оптимизация
      config.optimization.minimize = true;
      config.optimization.sideEffects = false;
    }

    // Алиасы для быстрой загрузки
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };

    return config;
  },

  // Компрессия и кеширование
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // SWC минификация включена по умолчанию в Next.js 15
}

module.exports = nextConfig 