/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enables static export
  trailingSlash: true, // Adds trailing slashes to URLs for static export compatibility
  images: {
    unoptimized: true, // Ensures images work with static export
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;