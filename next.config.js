/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    // Handle fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Exclude worker files from Terser minification
    config.optimization = {
      ...config.optimization,
      minimizer: config.optimization.minimizer.map((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.exclude = /HeartbeatWorker/;
        }
        return minimizer;
      }),
    };

    // Add rule to handle worker files differently
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      type: 'asset/source',
    });

    return config;
  },
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;