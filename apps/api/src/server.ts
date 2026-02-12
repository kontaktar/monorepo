import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

// Import routes
import userRoutes from "./routes/users.js";

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            },
          }
        : undefined,
  },
  trustProxy: true,
});

// Register CORS
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Kontaktar API",
      description: "API for Kontaktar service marketplace",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5001",
        description: "API Server",
      },
    ],
  },
});

await fastify.register(swaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

// Root endpoint
fastify.get("/", {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          name: { type: "string" },
          version: { type: "string" },
          status: { type: "string" },
          timestamp: { type: "string" },
        },
      },
    },
  },
  handler: async () => {
    return {
      name: "Kontaktar API",
      version: "1.0.0",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  },
});

// Health check endpoint
fastify.get("/health", {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          status: { type: "string" },
          uptime: { type: "number" },
          timestamp: { type: "string" },
        },
      },
    },
  },
  handler: async () => {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  },
});

// Register API routes
await fastify.register(userRoutes, { prefix: "/api/users" });

// Export for local development
export default fastify;

// Start listening (Vercel will handle this in production)
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

fastify.listen({ port: PORT, host: HOST });
