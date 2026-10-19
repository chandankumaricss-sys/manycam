import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // allow svg and external images if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
