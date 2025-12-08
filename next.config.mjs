import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // Fix "Yjs was already imported" error
    // This ensures only one instance of Yjs is used across all packages
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: require.resolve('yjs'),
    };
    return config;
  },
};

export default nextConfig;
