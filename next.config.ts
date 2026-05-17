import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression to save bandwidth and improve page speed
  poweredByHeader: false, // Disable X-Powered-By header for security and small byte savings
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
