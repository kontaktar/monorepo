import { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_PROJECT_URL:
      process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
};

export default nextConfig;
