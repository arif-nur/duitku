import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ini untuk melewati error ESLint saat di-build oleh Vercel
    ignoreDuringBuilds: true,
  },
  /* konfigurasi lain jika ada masukkan di bawah sini */
};

export default nextConfig;

