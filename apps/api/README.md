# Kontaktar API

A modern Fastify-based API for the Kontaktar service marketplace, built with TypeScript and designed to run both locally and on Vercel serverless functions.

## Features

- 🚀 **Fast Development**: Hot-reload with `tsx watch`
- 📦 **Modern Stack**: Fastify v5, TypeScript, ESM modules
- 📚 **Auto Documentation**: Swagger/OpenAPI UI built-in
- 🔒 **Type Safety**: TypeBox schema validation
- 🌐 **CORS Enabled**: Configurable CORS support
- 📊 **Structured Logging**: Pino with pretty printing in dev
- ☁️ **Vercel Ready**: Serverless function adapter included

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Environment Variables

Create a `.env` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_PROJECT_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=your_supabase_anon_key
PORT=5001
NODE_ENV=development
```

### Development

Run the API in watch mode with hot-reload:

```bash
# From the monorepo root
turbo dev --filter=api

# Or directly in the api directory
cd apps/api
pnpm dev
```

The API will be available at:
- 🌐 **API**: http://localhost:5001
- 📚 **Documentation**: http://localhost:5001/documentation
- 🏥 **Health Check**: http://localhost:5001/health

### Build

Build the API for production:

```bash
# From the monorepo root
turbo build --filter=api

# Or directly in the api directory
cd apps/api
pnpm build
```

### Production

Run the built API:

```bash
pnpm start
```

## API Endpoints

### Root
- `GET /` - API information and status

### Health
- `GET /health` - Health check with uptime

### Documentation
- `GET /documentation` - Interactive Swagger UI

### Users
- `GET /api/users/me` - Get current authenticated user (requires auth)
- `GET /api/users/:userId` - Get user by ID
- `PATCH /api/users/:userId` - Update user
- `GET /api/users` - List all users (admin only)

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts          # Entry point for local dev
│   ├── server.ts         # Fastify server setup & Vercel handler
│   └── routes/
│       └── users.ts      # User endpoints
├── dist/                 # Build output (ESM)
├── package.json
├── tsconfig.json
└── tsup.config.ts        # Build configuration
```

## Technology Stack

- **Framework**: [Fastify](https://fastify.dev) v5
- **Language**: TypeScript with ES Modules
- **Validation**: [TypeBox](https://github.com/sinclairzx81/typebox) with Fastify Type Provider
- **Build Tool**: [tsup](https://tsup.egoist.dev) (powered by esbuild)
- **Dev Runner**: [tsx](https://github.com/privatenumber/tsx)
- **Database**: Supabase (via `@kontaktar/database` package)
- **Docs**: Fastify Swagger & Swagger UI
- **Logging**: Pino (with pino-pretty in dev)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot-reload |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm check-types` | Type check without building |
| `pnpm lint` | Lint source code |
| `pnpm test` | Run tests |

## Vercel Deployment

The API includes a serverless handler for Vercel deployment. The `handler` function exported from `server.ts` is used by Vercel serverless functions located in `/api` directory at the project root.

### Build Command
```bash
turbo build --filter=api
```

### Environment Variables
Set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_PROJECT_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE`
- `CLERK_SECRET_KEY`
- `CLERK_SECRET_ADMIN_KEY`
- `NODE_ENV`

## Development Tips

### Hot Reload
The dev server uses `tsx watch` which automatically restarts on file changes. No need to manually restart!

### Logging
- **Development**: Pretty-printed, colorized logs
- **Production**: JSON-formatted logs for parsing

### Testing Endpoints

Using curl:
```bash
# Root endpoint
curl http://localhost:5001/

# Health check
curl http://localhost:5001/health

# User endpoint (will return 401 without auth)
curl http://localhost:5001/api/users/me
```

Using the test script:
```bash
# From project root
node test-api.js http://localhost:5001
```

### Database Integration

The API uses the `@kontaktar/database` workspace package which provides:
- `getUserById(userId)` - Fetch user by ID
- `updateUser(userId, updates)` - Update user profile
- `getCurrentUser()` - Get authenticated user

The Supabase client is lazy-initialized, so environment variables must be set before the first database call.

## Adding New Routes

1. Create a new route file in `src/routes/`:

```typescript
import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";

export default async function myRoutes(fastify: FastifyInstance) {
  fastify.get("/my-endpoint", {
    schema: {
      description: "My endpoint description",
      tags: ["my-tag"],
      response: {
        200: Type.Object({
          message: Type.String(),
        }),
      },
    },
    handler: async () => {
      return { message: "Hello!" };
    },
  });
}
```

2. Register the route in `src/server.ts`:

```typescript
import myRoutes from "./routes/my-routes.js";

// In createServer():
await server.register(myRoutes, { prefix: "/api/my-route" });
```

## Troubleshooting

### Port Already in Use
If port 5001 is already in use, set a different port:
```bash
PORT=5002 pnpm dev
```

### Environment Variables Not Loading
Make sure the `.env` file is in the **project root** (not in `apps/api/`).

### Module Not Found Errors
Ensure all workspace dependencies are installed:
```bash
pnpm install
```

### Supabase Connection Errors
Check that your Supabase environment variables are correctly set and the project is accessible.

## Contributing

When adding new features:
1. Add TypeBox schemas for request/response validation
2. Include OpenAPI documentation in route schemas
3. Handle errors gracefully with appropriate status codes
4. Add logging for debugging
5. Update this README if needed

## License

Private - Kontaktar Project