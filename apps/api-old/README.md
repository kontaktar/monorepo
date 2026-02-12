# Kontaktar API

A Fastify-based REST API for the Kontaktar service marketplace, deployed on Vercel.

## Overview

This API uses:
- **Framework**: Fastify
- **Language**: TypeScript
- **Hosting**: Vercel (serverless)
- **Database**: Supabase (PostgreSQL)
- **Documentation**: Swagger/OpenAPI

## Local Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

1. Install dependencies from the monorepo root:
```bash
pnpm install
```

2. Create a `.env` file in the monorepo root with required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_PROJECT_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=your_supabase_key
PORT=5001
```

3. Start the development server:
```bash
pnpm dev
```

The API will be available at:
- API: http://localhost:5001
- Documentation: http://localhost:5001/documentation
- Health Check: http://localhost:5001/health

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts          # Local development entry point
│   ├── server.ts         # Main Fastify server (Vercel entry point)
│   └── routes/
│       └── users.ts      # User routes
├── package.json
├── tsconfig.json
└── vercel.json          # Vercel configuration
```

## Deployment to Vercel

### How it Works

Vercel automatically detects and deploys Fastify applications by looking for entry point files named:
- `server.ts` / `server.js`
- `index.ts` / `index.js`
- `app.ts` / `app.js`

In the root or `src/` directory.

Our API uses `src/server.ts` as the entry point, which Vercel automatically detects and converts to a serverless function.

### Key Points

1. **No Build Step Required**: Vercel handles TypeScript compilation automatically
2. **Workspace Dependencies**: The `vercel.json` configures installation of monorepo dependencies
3. **TypeScript Source Files**: The API and its dependencies (`@kontaktar/database`) use `.ts` files directly
4. **Serverless**: The entire Fastify app becomes a single Vercel Function

### Deployment Steps

1. **Link the project** (first time only):
```bash
vercel link
```

2. **Deploy to preview**:
```bash
vercel
```

3. **Deploy to production**:
```bash
vercel --prod
```

### Environment Variables

Set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_PROJECT_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE` - Supabase publishable key
- `CORS_ORIGIN` - Allowed CORS origins (optional)
- `LOG_LEVEL` - Logging level (optional, default: "info")

## API Endpoints

### Root
- `GET /` - API information

### Health
- `GET /health` - Health check endpoint

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Documentation
- `GET /documentation` - Interactive Swagger UI

## Monorepo Structure

This API is part of a pnpm monorepo and depends on:

- `@kontaktar/database` - Database client and utilities
- `@repo/logger` - Shared logging utilities

These workspace packages are automatically resolved during deployment thanks to the `vercel.json` configuration:

```json
{
  "installCommand": "cd ../.. && pnpm install --filter=api..."
}
```

This ensures that:
1. pnpm installs from the monorepo root
2. The `--filter=api...` flag installs the API and all its dependencies (including workspace packages)
3. Workspace packages are properly linked

## Troubleshooting

### Module Not Found Errors

If you see errors like `Cannot find module '@kontaktar/database'`:

1. Ensure workspace packages are properly configured in `pnpm-workspace.yaml`
2. Check that `@kontaktar/database` package.json points to source files (not built files)
3. Verify the `vercel.json` install command includes `--filter=api...`

### Import Resolution

- Use imports without `.js` extensions: `import { foo } from "./bar"`
- TypeScript's `moduleResolution: "Bundler"` handles this correctly
- Vercel's TypeScript compiler handles the resolution during build

## Testing

Run tests with:
```bash
pnpm test
```

Type checking:
```bash
pnpm check-types
```

Linting:
```bash
pnpm lint
```

## Resources

- [Vercel Fastify Documentation](https://vercel.com/docs/frameworks/backend/fastify)
- [Fastify Documentation](https://fastify.dev)
- [Supabase Documentation](https://supabase.com/docs)