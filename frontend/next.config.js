/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Optimize development performance
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000, // Check for file changes every 1000ms (1 second)
      aggregateTimeout: 300, // Delay the rebuild after the first change
    };
    return config;
  },
  // Optimize production performance
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ['lucide-react'], // Optimize specific package imports
  },
  // Disable unnecessary features in development
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: process.env.NODE_ENV === 'production' 
            ? 'public, max-age=31536000, immutable' // Cache for 1 year in production
            : 'no-store, max-age=0', // No cache in development
        },
      ],
    },
  ],
};

module.exports = nextConfig; 