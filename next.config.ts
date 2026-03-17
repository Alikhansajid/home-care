import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/homeowner/dashboard",
        permanent: false,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
