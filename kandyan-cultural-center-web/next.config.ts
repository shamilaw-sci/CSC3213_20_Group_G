import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Set up the PWA configuration
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: false, // 🚨 DISABLED: Stops the router crash
  aggressiveFrontEndNavCaching: false, // 🚨 DISABLED: Stops the router crash
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 2. Existing Next.js configuration
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // 🚨 UPDATED: Double asterisk ensures all Supabase buckets pass through
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

// 3. Export the config wrapped in the PWA plugin
export default withPWA(nextConfig);