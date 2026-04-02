import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Extend server action & proxy timeout to 3 minutes for slow CPU-based AI inference
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Increase the outgoing HTTP keep-alive to 3 minutes
  httpAgentOptions: {
    keepAlive: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
