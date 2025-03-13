/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
      // Necessario per next/navigation in app router
      appDir: true,
    },
  };
  
  module.exports = nextConfig;