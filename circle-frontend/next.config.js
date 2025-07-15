/** @type {import('next').NextConfig} */
const nextConfig = {
  // Настройки для Telegram WebApp
  assetPrefix: process.env.NODE_ENV === 'production' ? '/webapp' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 