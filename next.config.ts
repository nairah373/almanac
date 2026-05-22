import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Razorpay's SDK is a CommonJS Node package — keep it server-external.
  serverExternalPackages: ["razorpay"],
};

export default nextConfig;
