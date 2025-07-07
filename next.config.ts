import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      // Add turbopack-specific rules if needed
    },
  },
};

// Only add webpack config when not using Turbopack
if (!process.env.TURBOPACK) {
  nextConfig.webpack = (config) => {
    config.cache = false;
    return config;
  };
}

export default nextConfig;
