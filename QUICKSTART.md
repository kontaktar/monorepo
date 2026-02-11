# Kontaktar V3 - Quick Start Guide

Get up and running with the Kontaktar service marketplace in 5 minutes.

## Prerequisites

- Node.js v18+
- pnpm v8.15.6+
- Supabase account
- Clerk account (2 instances: customer & admin)

## 1. Install Dependencies

```bash
cd kontaktar-v3
pnpm install
```

## 2. Verify Environment Variables

Your `.env` file should already be configured. Verify it:

```bash
pnpm test-env
```

You should see ✅ for all variables. If not, check your `.env` file in the root directory.

## 3. Set Up Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy and paste the contents of `packages/database/schema/init.sql`
4. Execute the script

This creates all necessary tables, RLS policies, and triggers.

## 4. Configure Clerk

### Customer App (Phone Authentication)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your customer app instance
3. Enable **Phone Number** authentication
4. Copy the keys to your `.env` file

### Admin App (Username/Password)
1. Select your admin app instance in Clerk
2. Enable **Username** and **Password** authentication
3. Copy the keys to your `.env` file

## 5. Start Development Servers

```bash
pnpm dev
```

This starts all three apps:
- **Customer App**: http://localhost:3000
- **Admin App**: http://localhost:3001  
- **API Server**: http://localhost:5001
- **API Docs**: http://localhost:5001/documentation

## 6. Test the Apps

### Customer App
1. Open http://localhost:3000
2. Click "Sign Up"
3. Register with a phone number
4. Verify you can access the dashboard

### Admin App
1. Open http://localhost:3001
2. Sign up with username/password
3. Access the admin dashboard

### API
1. Open http://localhost:5001/documentation
2. Test the `/status` endpoint

## Project Structure

```
kontaktar-v3/
├── apps/
│   ├── customer/      # Customer-facing app (Next.js)
│   ├── admin/         # Admin dashboard (Vite + React)
│   └── api/           # Backend API (Fastify)
├── packages/
│   └── database/      # Supabase client & schema
└── .env               # Environment variables
```

## Common Commands

```bash
# Run all apps
pnpm dev

# Run individual app
cd apps/customer && pnpm dev
cd apps/admin && pnpm dev
cd apps/api && pnpm dev

# Build all apps
pnpm build

# Lint code
pnpm lint

# Type check
pnpm check-types

# Verify environment
pnpm test-env
```

## Troubleshooting

### "Missing Clerk Secret Key"
```bash
# Recreate symlinks
cd apps/customer && ln -sf ../../.env .env.local
cd ../admin && ln -sf ../../.env .env.local
```

### "Database connection error"
- Verify Supabase credentials in `.env`
- Check that SQL migrations ran successfully
- Ensure RLS is enabled

### "Port already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. ✅ **Database is ready** - All tables and RLS policies are set
2. 📝 **Start building features**:
   - User profiles
   - Service listings
   - Order management
   - Reviews system
3. 📚 **Read detailed docs**:
   - `SETUP.md` - Comprehensive setup guide
   - `ENV_SETUP.md` - Environment variables explained
   - `packages/database/schema/init.sql` - Database schema

## Color Scheme

The app uses **royal red** for professionalism and trust:
- Primary: `#b91c1c` (red-700)
- Hover: `#991b1b` (red-800)
- Light: `#fef2f2` (red-50)

## Support

- Detailed setup: See `SETUP.md`
- Environment issues: See `ENV_SETUP.md`
- Database schema: See `packages/database/schema/`

---

**You're all set! 🚀** Start building your Fiverr clone!