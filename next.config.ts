import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Технически, стрикт мод нужен, чтобы помочь неопытным разрабам не насрать в прод, но мы же не такие))
  reactStrictMode: false,
};

export default nextConfig;
