# Kontaktar V3 Setup Guide

This guide will help you set up and run the Kontaktar V3 service marketplace application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8.15.6 or higher)
- **Git**

## Project Structure

```
kontaktar-v3/
├── apps/
│   ├── customer/        # Customer-facing Next.js app (port 3000)
│   ├── admin/          # Admin Vite React app (port 3001)
│   └── api/            # Fastify API server (port 5001)
├── packages/
│   ├── database/       # Supabase database client and schema
│   ├── ui/            # Shared UI components
│   └── ...
└── .env               # Environment variables (root)
```

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
cd kontaktar-v3

# Install dependencies
pnpm install
```

## Step 2: Set Up Supabase

1. **Create a Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project

2. **Get Your Supabase Credentials**
   - Go to Project Settings → API
   - Copy your **Project URL**
   - Copy your **anon/public key**

3. **Run Database Migrations**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Create a new query
   - Copy the contents of `packages/database/schema/init.sql`
   - Paste and run the SQL script
   - This will create all necessary tables, RLS policies, and triggers

## Step 3: Set Up Clerk Authentication

### For Customer App (Phone Authentication)

1. **Create a Clerk Account**
   - Go to [https://clerk.com](https://clerk.com)
   - Sign up for an account
   - Create a new application for **Customer App**

2. **Configure Phone Authentication**
   - In your Clerk dashboard, go to "User & Authentication" → "Email, Phone, Username"
   - Enable **Phone number** authentication
   - Disable other methods if you only want phone authentication

3. **Get Your Clerk Credentials**
   - Go to API Keys
   - Copy your **Publishable Key**
   - Copy your **Secret Key**

### For Admin App (Username/Password Authentication)

1. **Create Another Clerk Application**
   - Create a second application in Clerk for **Admin App**

2. **Configure Username/Password Authentication**
   - In your Clerk dashboard, go to "User & Authentication" → "Email, Phone, Username"
   - Enable **Username** and **Password** authentication
   - Disable phone authentication for this app

3. **Get Your Admin Clerk Credentials**
   - Go to API Keys
   - Copy your **Publishable Key**
   - Copy your **Secret Key**

## Step 4: Configure Environment Variables

Your `.env` file should already exist in the root directory. Ensure it has the following structure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=YOUR_SUPABASE_ANON_KEY

# Clerk - Customer App
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_CUSTOMER_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_CUSTOMER_SECRET_KEY

# Clerk - Admin App
NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY=pk_test_YOUR_ADMIN_PUBLISHABLE_KEY
CLERK_SECRET_ADMIN_KEY=sk_test_YOUR_ADMIN_SECRET_KEY
```

**Note:** The `.env` file is automatically symlinked to both `apps/customer/.env.local` and `apps/admin/.env.local`.

## Step 5: Set Up Clerk Webhooks (Optional but Recommended)

To sync Clerk users with your Supabase database:

1. **Start Your Development Server** (see Step 6)
2. **Expose Your Local Server** using a tool like ngrok:
   ```bash
   ngrok http 3000
   ```
3. **Configure Webhook in Clerk**
   - In your Clerk dashboard, go to Webhooks
   - Add endpoint: `https://YOUR_NGROK_URL/api/webhook/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret

4. **Add Webhook Secret to .env**
   ```env
   CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
   ```

## Step 6: Run the Applications

### Development Mode (All Apps)

```bash
# Run all apps concurrently
pnpm dev
```

This will start:
- **Customer App**: http://localhost:3000
- **Admin App**: http://localhost:3001
- **API Server**: http://localhost:5001
- **API Docs**: http://localhost:5001/documentation

### Run Individual Apps

```bash
# Customer app only
cd apps/customer
pnpm dev

# Admin app only
cd apps/admin
pnpm dev

# API server only
cd apps/api
pnpm dev
```

## Step 7: Verify Setup

### Customer App
1. Open http://localhost:3000
2. Click "Sign Up"
3. Register with a phone number
4. Verify you can log in

### Admin App
1. Open http://localhost:3001
2. Create an account with username/password
3. Verify you can access the admin dashboard

### API Server
1. Open http://localhost:5001/documentation
2. Verify Swagger documentation loads
3. Test the `/status` endpoint

## Troubleshooting

### "Missing Clerk Secret Key or API Key"

**Solution:**
- Verify your `.env` file exists in the root directory
- Check that environment variables are correctly named
- Restart your development server
- Check the symlinks:
  ```bash
  ls -la apps/customer/.env.local
  ls -la apps/admin/.env.local
  ```

### "PostCSS module not found"

**Solution:**
```bash
pnpm install
```

### "Cannot find module '@kontaktar/database'"

**Solution:**
```bash
# Rebuild the monorepo
pnpm run build
```

### Database Connection Errors

**Solution:**
- Verify your Supabase URL and key in `.env`
- Ensure RLS is enabled in Supabase
- Check that the SQL migrations ran successfully

### Port Already in Use

**Solution:**
```bash
# Kill process on specific port (example: 3000)
lsof -ti:3000 | xargs kill -9
```

## Color Scheme

The application uses a **royal red** color scheme to convey professionalism and trust:

- Primary color: Red 700 (`#b91c1c`)
- Hover state: Red 800 (`#991b1b`)
- Light backgrounds: Red 50 (`#fef2f2`)

## Next Steps

After completing setup:

1. **Create Test Users** in both customer and admin apps
2. **Explore the Database** in Supabase dashboard
3. **Review RLS Policies** to understand security
4. **Start Building Features** (services, orders, reviews)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Fastify Documentation](https://www.fastify.io)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## Support

If you encounter issues not covered in this guide, check:
- Project's GitHub issues
- Supabase community forums
- Clerk support documentation