import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/vercel.ts", "src/**/*", "!src/**/*.test.*"],
  format: ["cjs"],
  outExtensions: () => ({
    js: ".cjs",
  }),
});
