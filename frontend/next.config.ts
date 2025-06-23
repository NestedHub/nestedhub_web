import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        port: "", // Keep port empty if not specified
        pathname: "/**", // Use '/**' to allow all paths under the hostname
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "", // Keep port empty
        pathname: "/**", // Use '/**' to allow all paths under picsum.photos
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "", // Cloudinary does not use a specific port for image serving
        pathname: "/**", // This allows any path from your Cloudinary cloud (e.g., /image/upload/...)
      },
      // --- ADD THIS ENTRY FOR GOOGLE PROFILE PICTURES ---
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "", // Google image servers do not use a specific port
        pathname: "/**", // This allows any path from Google's user content domain
      },
    ],
  },

  // Combine webpack configurations. The `webpack` function is for both dev and prod.
  // `webpackDevMiddleware` is specifically for dev mode.
  // It's generally better to use the main `webpack` function for watchOptions.
  webpack: (config, { isServer }) => {
    // Apply watchOptions for development
    if (!isServer) {
      // Only apply this on the client-side bundle in development
      config.watchOptions = {
        poll: 1000, // Use the 1000ms poll from .js, or 10000 from .ts, choose your preference
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // Include experimental features from .js
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
    // Add any other experimental flags if your team had them here
  },

  // Include general Next.js configurations from .js
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Include ESLint and TypeScript ignore flags from .js (useful for dev builds)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Combine headers configuration.
  // The conditional Cache-Control from .js is more robust.
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value:
            process.env.NODE_ENV === "production"
              ? "public, max-age=31536000, immutable"
              : "no-store, max-age=0",
        },
      ],
    },
  ],
};

export default nextConfig;