import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync, lstatSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if .env file exists
const envPath = resolve(__dirname, ".env");
console.log("\n🔍 Environment Variables Diagnostic\n");
console.log("=".repeat(60));
console.log(`📁 Root directory: ${__dirname}`);
console.log(`📄 Env file path: ${envPath}`);
console.log(
  `📝 Env file exists: ${existsSync(envPath) ? "✅ YES" : "❌ NO"}\n`,
);

// Check symlinks
const customerEnvPath = resolve(__dirname, "apps/customer/.env.local");
const adminEnvPath = resolve(__dirname, "apps/admin/.env.local");

console.log("🔗 Symlink Status:");
if (existsSync(customerEnvPath)) {
  const isSymlink = lstatSync(customerEnvPath).isSymbolicLink();
  console.log(
    `   Customer app: ${isSymlink ? "✅ Linked" : "⚠️  File exists (not symlink)"}`,
  );
} else {
  console.log(`   Customer app: ❌ Missing`);
}

if (existsSync(adminEnvPath)) {
  const isSymlink = lstatSync(adminEnvPath).isSymbolicLink();
  console.log(
    `   Admin app: ${isSymlink ? "✅ Linked" : "⚠️  File exists (not symlink)"}`,
  );
} else {
  console.log(`   Admin app: ❌ Missing`);
}

console.log("\n" + "=".repeat(60));
console.log("🔑 Environment Variables:\n");

// Load environment variables from .env file
dotenv.config({ path: envPath });

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_PROJECT_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY",
  "CLERK_SECRET_ADMIN_KEY",
];

const maskValue = (value) => {
  if (!value) return "❌ NOT SET";
  if (value.length < 10) return "***";
  return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
};

let allPresent = true;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];
  const isPresent = !!value;

  if (!isPresent) allPresent = false;

  const status = isPresent ? "✅" : "❌";
  console.log(`${status} ${varName}`);
  console.log(`   ${maskValue(value)}\n`);
});

console.log("=".repeat(60));

if (allPresent) {
  console.log("✅ All required environment variables are set!\n");
  console.log("💡 Next steps:");
  console.log("   1. Run: pnpm dev");
  console.log("   2. Customer app will be at: http://localhost:3000");
  console.log("   3. Admin app will be at: http://localhost:3001");
  console.log("   4. API will be at: http://localhost:5001\n");
  process.exit(0);
} else {
  console.log("❌ Some environment variables are missing!\n");
  console.log("💡 Troubleshooting:");
  console.log("   1. Check your .env file exists in the root directory");
  console.log("   2. Verify all required variables are set");
  console.log("   3. Recreate symlinks if needed:");
  console.log("      cd apps/customer && ln -sf ../../.env .env.local");
  console.log("      cd ../admin && ln -sf ../../.env .env.local");
  console.log("   4. See ENV_SETUP.md for detailed instructions\n");
  process.exit(1);
}
