import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingIncludes: {
    '/api/**': ['./prisma/dev.db', './prisma/schema.prisma'],
    '/**': ['./prisma/dev.db'],
  },
};

export default nextConfig;
