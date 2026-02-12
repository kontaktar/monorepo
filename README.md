# Kontaktar V3

A modern service marketplace connecting customers with skilled professionals in Iceland. Built with Next.js, React, and Fastify in a monorepo architecture.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Verify environment variables
pnpm test-env

# Start all apps
pnpm dev
```

- **Customer App**: http://localhost:3000
- **Admin App**: http://localhost:3001
- **API Server**: http://localhost:5001
- **API Docs**: http://localhost:5001/documentation

## 📋 Prerequisites

- Node.js v18+
- pnpm v8.15.6+
- [Supabase account](https://supabase.com) (database)
- [Clerk account](https://clerk.com) (authentication)

## 🏗️ Project Structure

```
kontaktar-v3/
├── apps/
│   ├── customer/          # Customer-facing Next.js app (port 3000)
│   │   ├── public/fonts/  # Berlingske Sans & Serif fonts
│   │   └── src/
│   │       ├── app/       # App router pages
│   │       └── middleware.ts
│   ├── admin/             # Admin dashboard - Vite + React (port 3001)
│   └── api/               # Fastify API server (port 5001)
├── packages/
│   ├── database/          # Supabase client & schema
│   │   └── schema/        # SQL migrations
│   ├── ui/                # Shared UI components
│   ├── logger/            # Logging utility
│   └── config-*/          # Shared configs
└── .env                   # Environment variables (root)
```

## 📦 Installation

### 1. Clone and Install

```bash
cd kontaktar-v3
pnpm install
```

### 2. Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy **Project URL** and **anon/public key**
4. Go to **SQL Editor** and run `packages/database/schema/init.sql`

### 3. Authentication Setup (Clerk)

You need **two separate Clerk applications** (customer & admin).

#### Customer App (Email + Verification Code)

1. Create app at [clerk.com](https://dashboard.clerk.com)
2. Name it: `Kontaktar Customer`
3. Go to **User & Authentication → Email, Phone, Username**
4. Enable: ✅ **Email address** (with verification code)
5. Disable: ❌ Password, Phone, Username
6. Copy **Publishable Key** and **Secret Key**

#### Admin App (Email + Password)

1. Create another Clerk app: `Kontaktar Admin`
2. Go to **User & Authentication → Email, Phone, Username**
3. Enable: ✅ **Email address** ✅ **Password**
4. Disable: ❌ Phone, Username
5. Copy **Publishable Key** and **Secret Key**

### 4. Environment Variables

Create/update `.env` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_PROJECT_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=YOUR_SUPABASE_ANON_KEY

# Clerk - Customer App (Email + Code)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET

# Clerk - Admin App (Email + Password)
NEXT_PUBLIC_CLERK_PUBLISHABLE_ADMIN_KEY=pk_test_YOUR_ADMIN_KEY
CLERK_SECRET_ADMIN_KEY=sk_test_YOUR_ADMIN_SECRET

# Optional: Clerk Webhooks (for syncing users to Supabase)
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**Verify setup:**
```bash
pnpm test-env
```

### 5. Set Up Webhooks (Optional)

Sync Clerk users to Supabase automatically:

1. Expose local server with [ngrok](https://ngrok.com): `ngrok http 3000`
2. In Clerk dashboard → **Webhooks** → **Add Endpoint**
3. URL: `https://YOUR_NGROK_URL/api/webhook/clerk`
4. Events: ✅ `user.created` ✅ `user.updated` ✅ `user.deleted`
5. Copy **Signing Secret** to `.env` as `CLERK_WEBHOOK_SECRET`

## 🎨 Design System

### Brand Colors
- **Primary**: Red 700 (`#b91c1c`)
- **Hover**: Red 800 (`#991b1b`)
- **Light**: Red 50 (`#fef2f2`)

### Typography
- **Primary**: Berlingske Sans (Regular 400, Bold 700)
- **Secondary**: Berlingske Serif (Regular 400)
- **Usage**: `font-sans` (default) or `font-serif` (headings, emphasis)

## 🛠️ Development

### Commands

```bash
# Run all apps
pnpm dev

# Run individual apps
cd apps/customer && pnpm dev  # Port 3000
cd apps/admin && pnpm dev     # Port 3001
cd apps/api && pnpm dev       # Port 5001

# Build all
pnpm build

# Lint
pnpm lint

# Type check
pnpm check-types
```

### Tech Stack

- **Customer App**: Next.js 16.1.5 (App Router), Tailwind CSS, Clerk Auth
- **Admin App**: Vite + React 19, Tailwind CSS, Clerk Auth
- **API**: Fastify, Swagger/OpenAPI
- **Database**: Supabase (PostgreSQL)
- **Fonts**: Berlingske Sans & Serif (.woff2 only)
- **State**: React Query (planned)
- **Payments**: Mock (Stripe planned)

## 🔧 Troubleshooting

### "Missing Clerk Secret Key"

**Solution:**
```bash
# Verify .env exists
cat .env

# Recreate symlinks
cd apps/customer && ln -sf ../../.env .env.local
cd ../admin && ln -sf ../../.env .env.local

# Restart servers
pnpm dev
```

### TypeScript Errors in Middleware

The Clerk v6.37.3 types are incomplete. The `@ts-expect-error` comment is intentional and safe.

### "Port already in use"

```bash
# Kill process on port (example: 3000)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Errors

- Verify Supabase credentials in `.env`
- Check that SQL migrations ran successfully in Supabase SQL Editor
- Ensure RLS (Row Level Security) is enabled

### Build Errors with Clerk

If you see "Export authMiddleware doesn't exist":
- This is expected with Clerk v6.37.3
- The `@ts-expect-error` comment in middleware.ts handles this
- The code works at runtime despite TypeScript complaints

## 📝 Authentication Flow

### Customer App
1. User enters email
2. Receives verification code via email
3. Enters code to complete sign-up
4. Redirected to homepage

### Admin App
1. Admin enters email + password
2. Authenticated immediately
3. Access to admin dashboard

**Note:** Customer and admin use separate Clerk instances to maintain security isolation.

## 🗃️ Database Schema

See `packages/database/schema/init.sql` for complete schema.

Key tables:
- `users` - User profiles with role-based access (user/admin)
- Row Level Security (RLS) policies enforce access control
- Triggers for `updated_at` timestamps

## 🚧 Current Status

### ✅ Implemented
- Customer app with modern homepage
- Email + verification code authentication (customer)
- Email + password authentication (admin)
- Berlingske font integration
- Top loading bar for navigation
- Red brand theme throughout
- Responsive design with Tailwind
- Clerk webhook handler for user sync
- Database schema with RLS

### 🔜 Planned
- User profiles and dashboards
- Service/gig listings
- Search functionality
- Booking system
- Payment integration (Stripe)
- Reviews and ratings
- Messaging (Ably)

## 📚 Additional Documentation

- `Data-structure.md` - Database table structure reference
- `Priority.md` - Feature priority list
- `packages/database/schema/init.sql` - Database migrations

## 🤝 Contributing

This is a private project. For questions or issues:
1. Check this README first
2. Review the troubleshooting section
3. Verify environment variables with `pnpm test-env`

## 📄 License

Private project - All rights reserved

---

**Built with ❤️ in Iceland**