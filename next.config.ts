import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Mengabaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mengabaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

