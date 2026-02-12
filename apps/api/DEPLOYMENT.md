# API Deployment Guide

This guide explains how to deploy the Kontaktar API to Vercel.

## Architecture

The API is built with Fastify and deployed as Vercel Serverless Functions. The deployment structure is:

```
kontaktar-v3/
├── api/                          # Vercel API routes (serverless functions)
│   ├── index.js                  # Main entry point
│   └── [...path].js             # Catch-all route
├── apps/api/                     # Source code
│   ├── src/
│   │   ├── server.ts            # Fastify server setup
│   │   ├── vercel.ts            # Vercel serverless adapter
│   │   ├── index.ts             # Local development entry
│   │   └── routes/              # API routes
│   └── dist/                    # Built output (CJS)
│       └── vercel.cjs           # Compiled serverless handler
└── vercel.json                  # Vercel configuration
```

## How It Works

1. **Build Process**: 
   - TypeScript files are compiled to CommonJS using `tsdown`
   - Output goes to `apps/api/dist/`
   - The `vercel.cjs` file is the main serverless handler

2. **Request Flow**:
   - All requests hit the `/api` routes (Vercel serverless functions)
   - These routes import the compiled `vercel.cjs` handler
   - The handler creates a Fastify instance and processes the request
   - Response is sent back through Vercel's serverless infrastructure

3. **Environment Variables**:
   - Managed through `turbo.json` for build-time hashing
   - Set in Vercel dashboard for runtime
   - Required variables: `CLERK_SECRET_KEY`, `CLERK_SECRET_ADMIN_KEY`, `SUPABASE_*`, `DATABASE_URL`

## Deployment Steps

### 1. Prepare Your Environment

Make sure all required environment variables are set in your Vercel project:

- `CLERK_SECRET_KEY`
- `CLERK_SECRET_ADMIN_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- Any other environment variables your API needs

### 2. Build Locally (Optional but Recommended)

Test the build before deploying:

```bash
cd apps/api
pnpm run build
```

Verify the output in `apps/api/dist/vercel.cjs` exists.

### 3. Deploy to Vercel

**Option A: Via Git Integration (Recommended)**

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Deploy API"
   git push
   ```

2. Vercel will automatically deploy when you push to your connected branch

**Option B: Via Vercel CLI**

```bash
vercel --prod
```

### 4. Verify Deployment

After deployment, test your API:

```bash
# Test status endpoint
curl https://your-deployment-url.vercel.app/status

# Should return:
# {
#   "status": "ok",
#   "timestamp": "2024-01-XX..."
# }
```

Or use the test script:

```bash
node test-api.js https://your-deployment-url.vercel.app
```

### 5. Check Swagger Documentation

Visit: `https://your-deployment-url.vercel.app/documentation`

This should show the Swagger UI with all available API endpoints.

## Troubleshooting

### Issue: "Cannot find module" errors

**Cause**: Missing dependencies or incorrect build output

**Solution**:
1. Verify `apps/api/dist/vercel.cjs` exists after build
2. Check that `tsdown` is building all necessary files
3. Ensure `package.json` has all dependencies (not just devDependencies)

### Issue: "No entrypoint found which imports fastify"

**Cause**: Vercel can't detect the Fastify import

**Solution**:
- Ensure `apps/api/src/vercel.ts` directly imports `fastify`
- Verify the build output in `dist/vercel.cjs` includes the import
- Check that `api/index.js` and `api/[...path].js` exist

### Issue: All routes return 404

**Cause**: Vercel routing configuration issue

**Solution**:
1. Check `vercel.json` has proper rewrites
2. Ensure `/api` directory exists at root
3. Verify serverless function files are in `/api` directory

### Issue: Environment variables not available

**Cause**: Variables not declared in `turbo.json` or Vercel dashboard

**Solution**:
1. Add variables to `turbo.json` under `globalEnv` or task-specific `env`
2. Set variables in Vercel dashboard: Project Settings → Environment Variables
3. Redeploy after adding variables

### Issue: Function timeout errors

**Cause**: Serverless function taking too long

**Solution**:
- Increase `maxDuration` in `vercel.json` (max 60s on Pro plan)
- Optimize database queries
- Add connection pooling

### Issue: Build fails with Turbo errors

**Cause**: Turborepo build issues

**Solution**:
1. Check `turbo.json` configuration
2. Verify all workspace dependencies are properly linked
3. Try: `pnpm install && pnpm run build --filter=api --force`

## Vercel Configuration Reference

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "pnpm install && pnpm run build --filter=api",
  "installCommand": "pnpm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### turbo.json

Important environment variables should be declared:

```json
{
  "globalEnv": ["CLERK_SECRET_KEY", "CLERK_SECRET_ADMIN_KEY", "NODE_ENV"],
  "tasks": {
    "build": {
      "env": ["CLERK_*", "SUPABASE_*", "DATABASE_URL"]
    }
  }
}
```

## Available Endpoints

- `GET /status` - Health check endpoint
- `GET /documentation` - Swagger UI
- `GET /api/users/me` - Get current user (requires auth)
- `GET /api/users/:userId` - Get user by ID
- `PATCH /api/users/:userId` - Update user
- `GET /api/users` - Get all users (admin only)

## Performance Tips

1. **Cold Starts**: First request after idle period will be slower. Consider:
   - Using Vercel's Edge Functions for faster cold starts
   - Implementing a warming strategy
   - Keeping functions small and focused

2. **Database Connections**: 
   - Use connection pooling (Supabase provides this)
   - Don't create new connections per request
   - Close connections properly

3. **Caching**:
   - Use Vercel's Edge Caching where appropriate
   - Implement application-level caching for expensive operations
   - Set proper Cache-Control headers

## Monitoring

1. **Vercel Dashboard**:
   - Go to your project → Functions tab
   - Monitor invocations, errors, and duration
   - Check logs for debugging

2. **Custom Monitoring**:
   - Add logging with timestamps
   - Use error tracking services (Sentry, LogRocket, etc.)
   - Set up uptime monitoring (UptimeRobot, Pingdom)

## Local Development

To run the API locally:

```bash
cd apps/api
pnpm run dev
```

The API will be available at `http://localhost:5001`

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] Database is properly configured with connection pooling
- [ ] Error handling is implemented
- [ ] Authentication is properly configured (Clerk)
- [ ] CORS settings are appropriate for your frontend
- [ ] Rate limiting is implemented (if needed)
- [ ] Logging and monitoring are set up
- [ ] API documentation is up to date
- [ ] Tests are passing
- [ ] Build succeeds locally

## Support

If you encounter issues not covered here:

1. Check Vercel deployment logs
2. Review the Vercel documentation: https://vercel.com/docs
3. Check Fastify documentation: https://fastify.dev
4. Review Turborepo docs: https://turbo.build/repo/docs

## Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Fastify with Vercel](https://fastify.dev/docs/latest/Guides/Serverless/)
- [Turborepo Environment Variables](https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables)