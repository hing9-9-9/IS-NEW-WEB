import type { NextConfig } from "next";

// INTERNAL_API_URL: server-side only, used for Next.js rewrites (never same as public domain)
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8070";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${INTERNAL_API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
