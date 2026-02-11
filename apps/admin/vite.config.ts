import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env file from the root of the monorepo
  const envDir = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, envDir, "");

  return {
    plugins: [react()],
    envDir: envDir,
    define: {
      "process.env.VITE_CLERK_PUBLISHABLE_ADMIN_KEY": JSON.stringify(
        env.NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY,
      ),
      "process.env.VITE_CLERK_SECRET_ADMIN_KEY": JSON.stringify(
        env.CLERK_SECRET_ADMIN_KEY,
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL": JSON.stringify(
        env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
      ),
      "process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE": JSON.stringify(
        env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE,
      ),
    },
  };
});
