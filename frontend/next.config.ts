import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**', // Allows all paths under this hostname
      },
    ],
  },
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for file changes every 1000ms (1 second)
    };
    return config;
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, max-age=0', // Disable caching in development
        },
      ],
    },
  ],
};

export default nextConfig;