/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  // Aggiungi la configurazione per i font di Bootstrap
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|svg)$/,
      use: {
        loader: 'url-loader',
      },
    });
    return config;
  },
};

module.exports = nextConfig;