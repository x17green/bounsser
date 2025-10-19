// Load environment configuration from root directory
import envConfig from "./env.config.ts";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Load environment variables from centralized config
  env: envConfig.env,
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons"],
  },
  // Prevent Google Fonts build failures
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable font optimization for offline builds
  optimizeFonts: false,
};

export default nextConfig;
