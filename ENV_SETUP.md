# Environment Variables Setup Guide

## Overview

This document explains how environment variables are configured across the Kontaktar V3 monorepo and how to verify they're loading correctly.

## Problem We Solved

Initially, the apps couldn't find their environment variables, showing errors like:
- **Customer App**: "Missing Clerk Secret Key or API Key"
- **Admin App**: "Missing Publishable Key"

This was because:
1. The `.env` file exists in the root directory
2. Next.js and Vite apps need to read from their own directories
3. Environment variable names weren't properly mapped

## Solution Implemented

### 1. Symbolic Links

We created symbolic links from each app directory to the root `.env` file:

```bash
apps/customer/.env.local -> ../../.env
apps/admin/.env.local -> ../../.env
```

This allows both apps to read the same environment variables without duplication.

### 2. Environment Variable Mapping

#### Root `.env` File Structure

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://mcoxcnikssgzgdtlzcwh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=sb_publishable_Z9VZ8dQdmCRTbOi7i1JkrA_pPDWCGST

# Clerk - Customer App (Phone Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YmV0dGVyLW1hc3RvZG9uLTM0LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_bbjXJyMfst8KGT6wOv7ck66NyCZnLwdP8Y9gATDeJf

# Clerk - Admin App (Username/Password Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY=pk_test_c3RpcnJlZC1pYmV4LTk2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_ADMIN_KEY=sk_test_33HRHg32gBP2TXdB8gnZsTdaYieKLfsSaffqAFbDUx
```

### 3. App-Specific Configuration

#### Customer App (Next.js)

**File**: `apps/customer/next.config.ts`

Next.js automatically loads `.env.local` files from the app directory. Our symlink ensures it reads from the root `.env`.

Environment variables used:
- `NEXT_PUBLIC_SUPABASE_PROJECT_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE` - Supabase anon/public key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for customer app
- `CLERK_SECRET_KEY` - Clerk secret key for customer app

#### Admin App (Vite)

**File**: `apps/admin/vite.config.ts`

Vite requires explicit configuration to load environment variables from the root:

```typescript
export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, "../../");
  const env = loadEnv(mode, envDir, "");

  return {
    plugins: [react()],
    envDir: envDir,
    define: {
      "process.env.VITE_CLERK_PUBLISHABLE_ADMIN_KEY": JSON.stringify(
        env.NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY
      ),
      // ... other variables
    },
  };
});
```

Environment variables used:
- `VITE_CLERK_PUBLISHABLE_ADMIN_KEY` (mapped from `NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY`)
- `VITE_CLERK_SECRET_ADMIN_KEY` (mapped from `CLERK_SECRET_ADMIN_KEY`)
- `NEXT_PUBLIC_SUPABASE_PROJECT_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE`

#### API Server (Fastify)

**File**: `apps/api/src/index.ts`

Uses `dotenv` to load environment variables from the root:

```typescript
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
```

#### Database Package

**File**: `packages/database/src/index.ts`

Reads environment variables that are passed from the consuming app:

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE || "";
```

## Verification

### Test Environment Variables

Run the verification script from the root directory:

```bash
pnpm test-env
```

Expected output:

```
🔍 Environment Variables Check

============================================================
✅ NEXT_PUBLIC_SUPABASE_PROJECT_URL
   https://...e.co

✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE
   sb_publi...CGST

✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   pk_test_...diQ

✅ CLERK_SECRET_KEY
   sk_test_...eJf

✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY
   pk_test_...diQ

✅ CLERK_SECRET_ADMIN_KEY
   sk_test_...bDUx

============================================================
✅ All required environment variables are set!
```

### Verify Symlinks

Check that symlinks are created correctly:

```bash
ls -la apps/customer/.env.local
ls -la apps/admin/.env.local
```

Expected output:

```
lrwxr-xr-x  1 user  staff  10 Feb 11 22:11 apps/customer/.env.local -> ../../.env
lrwxr-xr-x  1 user  staff  10 Feb 11 22:11 apps/admin/.env.local -> ../../.env
```

## How Environment Variables Are Used

### In Customer App (Next.js)

1. **Clerk Authentication**
   - Uses `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for client-side authentication
   - Uses `CLERK_SECRET_KEY` for server-side operations

2. **Supabase Database**
   - Uses `NEXT_PUBLIC_SUPABASE_PROJECT_URL` for database connection
   - Uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE` for public/anon access

### In Admin App (Vite/React)

1. **Clerk Authentication**
   - Uses `VITE_CLERK_PUBLISHABLE_ADMIN_KEY` (mapped from `NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY`)
   - Separate Clerk instance for admin-only access

2. **Supabase Database**
   - Same database connection as customer app
   - Different RLS policies apply based on user role

### In API Server (Fastify)

1. **Environment Variables**
   - Port configuration
   - Future: API keys for external services

2. **Database Access**
   - Imports from `@kontaktar/database` package
   - Database package reads Supabase env vars

## Troubleshooting

### Issue: "Missing Clerk Secret Key or API Key"

**Causes:**
- `.env` file doesn't exist or is empty
- Symlinks are broken
- Environment variable names don't match

**Solutions:**
1. Verify `.env` exists in root: `cat .env`
2. Check symlinks: `ls -la apps/*/env.local`
3. Run test script: `pnpm test-env`
4. Recreate symlinks:
   ```bash
   cd apps/customer && ln -sf ../../.env .env.local
   cd ../admin && ln -sf ../../.env .env.local
   ```

### Issue: "Missing Publishable Key" (Admin App)

**Causes:**
- Vite config not loading environment variables
- Wrong environment variable name

**Solutions:**
1. Check Vite config loads from root directory
2. Verify mapping in `vite.config.ts`
3. Restart dev server (Vite caches config)

### Issue: Environment Variables Not Updating

**Solutions:**
1. Restart all dev servers
2. Clear Next.js cache: `rm -rf apps/customer/.next`
3. Clear Vite cache: `rm -rf apps/admin/node_modules/.vite`
4. Rebuild: `pnpm build`

## Best Practices

### DO ✅

- Keep all environment variables in the root `.env` file
- Use `NEXT_PUBLIC_` prefix for client-side Next.js variables
- Use descriptive variable names
- Run `pnpm test-env` before committing changes
- Document new environment variables in this file

### DON'T ❌

- Don't create separate `.env` files in app directories
- Don't hardcode sensitive values in source code
- Don't commit `.env` to version control (it's in `.gitignore`)
- Don't use production keys in development

## Adding New Environment Variables

1. **Add to root `.env` file**
   ```env
   NEW_VARIABLE=value
   ```

2. **For Next.js apps**: Use `NEXT_PUBLIC_` prefix if needed on client-side

3. **For Vite apps**: Add to `vite.config.ts` define section

4. **For API server**: Variables are automatically loaded via `dotenv`

5. **Update this documentation**

6. **Test**: Run `pnpm test-env` and restart dev servers

## Security Notes

- **Never commit `.env` files** - They contain sensitive keys
- **Use different keys** for development and production
- **Rotate keys regularly** - Especially if exposed
- **Limit key permissions** - Use appropriate Clerk/Supabase settings
- **Service role keys** - Keep server-side only, never expose to client

## Environment Variable Lifecycle

```
Root .env file
    ↓
    ├─→ apps/customer/.env.local (symlink)
    │       ↓
    │   Next.js reads and exposes NEXT_PUBLIC_* to client
    │
    ├─→ apps/admin/.env.local (symlink)
    │       ↓
    │   Vite config reads and maps to process.env.VITE_*
    │
    └─→ apps/api (dotenv)
            ↓
        Loaded at runtime via dotenv.config()
```

## Summary

All environment variables are now:
- ✅ Stored in one location (root `.env`)
- ✅ Accessible to all apps via symlinks
- ✅ Properly mapped for each framework (Next.js, Vite, Node.js)
- ✅ Testable via `pnpm test-env`
- ✅ Following security best practices

The system is ready for development! 🚀