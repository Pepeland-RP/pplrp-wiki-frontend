import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Технически, стрикт мод нужен, чтобы помочь неопытным разрабам не насрать в прод, но мы же не такие))
  reactStrictMode: false,

  webpack(config) {
    config.cache = false;
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
