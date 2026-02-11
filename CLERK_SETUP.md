# Clerk Authentication Setup Guide

This guide will walk you through setting up Clerk authentication for both the **Customer App** (phone authentication) and **Admin App** (username/password authentication).

## Overview

Kontaktar uses two separate Clerk instances:

1. **Customer App** - Phone number authentication for end users
2. **Admin App** - Username/password authentication for administrators

## Prerequisites

- A Clerk account ([sign up here](https://clerk.com))
- Access to your project's `.env` file
- Development servers stopped (you'll restart them after setup)

---

## Part 1: Customer App Setup (Phone Authentication)

### Step 1: Create Customer Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"+ Create application"**
3. Name it: `Kontaktar Customer`
4. Click **"Create application"**

### Step 2: Configure Phone Authentication

1. In your new application, go to **"User & Authentication"** → **"Email, Phone, Username"**
2. **Enable** the following:
   - ✅ Phone number
3. **Disable** the following:
   - ❌ Email address
   - ❌ Username
   - ❌ Password
   - ❌ Social login providers (optional, enable if desired)

4. Click **"Save changes"**

### Step 3: Configure Phone Number Settings

1. Go to **"User & Authentication"** → **"Phone numbers"**
2. Set verification method: **SMS verification code**
3. Configure SMS provider (Clerk provides a default for development)
4. For production, consider integrating with Twilio or another SMS provider

### Step 4: Get API Keys

1. Go to **"API Keys"** in the left sidebar
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Add to your `.env` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CUSTOMER_KEY_HERE
   CLERK_SECRET_KEY=sk_test_YOUR_CUSTOMER_SECRET_HERE
   ```

---

## Part 2: Admin App Setup (Username/Password Authentication)

### Step 1: Create Admin Application

1. Go back to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click **"+ Create application"** again (create a second app)
3. Name it: `Kontaktar Admin`
4. Click **"Create application"**

### Step 2: Configure Username/Password Authentication

1. In your admin application, go to **"User & Authentication"** → **"Email, Phone, Username"**
2. **Enable** the following:
   - ✅ Email address (for account recovery)
   - ✅ Username
   - ✅ Password
3. **Disable** the following:
   - ❌ Phone number
   - ❌ Social login providers

4. Click **"Save changes"**

### Step 3: Configure Password Requirements (Optional)

1. Go to **"User & Authentication"** → **"Restrictions"**
2. Set password requirements:
   - Minimum length: 8 characters
   - Require uppercase, lowercase, numbers, special characters (recommended)

### Step 4: Get API Keys

1. Go to **"API Keys"** in the left sidebar
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

3. Add to your `.env` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY=pk_test_YOUR_ADMIN_KEY_HERE
   CLERK_SECRET_ADMIN_KEY=sk_test_YOUR_ADMIN_SECRET_HERE
   ```

---

## Part 3: Configure Webhooks (Optional but Recommended)

Webhooks sync Clerk users to your Supabase database automatically.

### Step 1: Expose Your Local Development Server

For local development, use a tunneling service like ngrok:

```bash
# In a new terminal
ngrok http 3000
```

Copy the HTTPS URL provided (e.g., `https://abc123.ngrok.io`)

### Step 2: Configure Webhook in Customer App

1. Go to your **Customer App** in Clerk Dashboard
2. Navigate to **"Webhooks"** in the left sidebar
3. Click **"+ Add Endpoint"**
4. Configure:
   - **Endpoint URL**: `https://YOUR_NGROK_URL/api/webhook/clerk`
   - **Subscribe to events**:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted`
5. Click **"Create"**
6. Copy the **Signing Secret** (starts with `whsec_`)

### Step 3: Add Webhook Secret to Environment

Add to your `.env` file:

```env
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 4: For Production

When deploying to production:

1. Update the webhook URL to your production domain
2. Use the same events configuration
3. Get a new signing secret for the production endpoint

---

## Part 4: Verify Configuration

### Step 1: Check Environment Variables

Run the verification script:

```bash
pnpm test-env
```

You should see ✅ for all Clerk-related variables.

### Step 2: Start Development Servers

```bash
pnpm dev
```

### Step 3: Test Customer App

1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Enter a phone number
4. Verify you receive an SMS code
5. Complete registration
6. Verify you're redirected to the homepage

### Step 4: Test Admin App

1. Open http://localhost:3001
2. Click **"Sign Up"** tab
3. Create an account with username and password
4. Verify you can log in
5. Check the admin dashboard loads

---

## Troubleshooting

### Issue: "Missing Clerk Secret Key or API Key"

**Cause**: Environment variables not loaded correctly

**Solution**:
1. Verify `.env` file exists in root directory
2. Check symlinks exist:
   ```bash
   ls -la apps/customer/.env.local
   ls -la apps/admin/.env.local
   ```
3. Recreate symlinks if needed:
   ```bash
   cd apps/customer && ln -sf ../../.env .env.local
   cd ../admin && ln -sf ../../.env .env.local
   ```
4. Restart dev servers

### Issue: "auth() and currentUser() are only supported in App Router"

**Cause**: Using old Clerk API or incorrect imports

**Solution**:
This has been fixed in the latest version. Ensure you're using:
- `@clerk/nextjs` version 6.0.0 or higher
- Import from `@clerk/nextjs/server` for server-side functions
- Make page components `async` when using `auth()`

Example:
```typescript
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  // ...
}
```

### Issue: Phone Number Not Working

**Causes**:
1. Phone authentication not enabled in Clerk
2. SMS provider not configured
3. Invalid phone number format

**Solutions**:
1. Verify phone auth is enabled in Clerk dashboard
2. Check SMS provider configuration
3. Use international format: +[country code][number]
4. For testing, use Clerk's test phone numbers

### Issue: Admin App Can't Use Usernames

**Cause**: Username authentication not enabled

**Solution**:
1. Go to Admin app in Clerk Dashboard
2. Navigate to **"User & Authentication"** → **"Email, Phone, Username"**
3. Enable **Username** and **Password**
4. Disable **Phone number**

### Issue: Webhooks Not Working

**Causes**:
1. Incorrect webhook URL
2. Wrong signing secret
3. Events not subscribed

**Solutions**:
1. Verify webhook URL is publicly accessible
2. Check signing secret in `.env` matches Clerk dashboard
3. Ensure `user.created`, `user.updated`, `user.deleted` are enabled
4. Check webhook logs in Clerk dashboard for errors

### Issue: Users Not Syncing to Supabase

**Causes**:
1. Webhook not configured
2. Supabase credentials incorrect
3. Database tables not created

**Solutions**:
1. Set up webhooks (see Part 3)
2. Verify Supabase credentials in `.env`
3. Run database migration: `packages/database/schema/init.sql`
4. Check Supabase logs for RLS policy errors

---

## Environment Variables Summary

Your final `.env` file should have these Clerk-related variables:

```env
# Clerk - Customer App (Phone Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk - Admin App (Username/Password Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY=pk_test_...
CLERK_SECRET_ADMIN_KEY=sk_test_...

# Clerk Webhooks (Optional)
CLERK_WEBHOOK_SECRET=whsec_...
```

---

## Best Practices

### Development

- ✅ Use test mode keys (starts with `pk_test_` and `sk_test_`)
- ✅ Test with real phone numbers or Clerk test numbers
- ✅ Use ngrok or similar for webhook testing
- ✅ Keep customer and admin apps separate

### Production

- ✅ Use production keys (starts with `pk_live_` and `sk_live_`)
- ✅ Configure custom SMS provider (Twilio, etc.)
- ✅ Set up production webhook endpoints
- ✅ Enable rate limiting in Clerk dashboard
- ✅ Configure custom branding (optional)
- ✅ Set up MFA for admin accounts (optional but recommended)

### Security

- ❌ Never commit `.env` files to version control
- ❌ Never expose secret keys in client-side code
- ❌ Never use production keys in development
- ✅ Rotate keys if compromised
- ✅ Use environment-specific keys
- ✅ Enable webhooks signature verification
- ✅ Implement rate limiting on sign-up endpoints

---

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Phone Authentication](https://clerk.com/docs/authentication/phone)
- [Clerk Webhooks Guide](https://clerk.com/docs/webhooks/overview)
- [Clerk API Reference](https://clerk.com/docs/reference/backend-api)

---

## Recent Updates (Feb 2024)

### What Changed

We upgraded from Clerk v4 to v6 to fix compatibility issues with Next.js 16:

1. **Updated Package**: `@clerk/nextjs` from 4.29.9 to 6.37.3
2. **New Middleware**: Switched from `authMiddleware` to `clerkMiddleware`
3. **Server Imports**: Use `@clerk/nextjs/server` for server-side functions
4. **Async Functions**: Page components using `auth()` must be async

### Migration Impact

If you were using the old version:
- Update imports: `import { auth } from "@clerk/nextjs/server"`
- Make pages async: `export default async function Page()`
- Update middleware to use `clerkMiddleware`
- Add `@clerk/backend` for webhook types

These changes are already implemented in the codebase.

---

## Support

If you encounter issues not covered here:

1. Check Clerk Dashboard → Logs for detailed error messages
2. Review `ENV_SETUP.md` for environment variable configuration
3. Run `pnpm test-env` to verify configuration
4. Check [Clerk Community](https://clerk.com/discord) for help

---

**Setup Complete! 🎉**

Your Clerk authentication is now configured for both customer and admin apps.