import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

// Import routes
import userRoutes from "./src/routes/users.js";

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
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

// Register Swagger
fastify.register(swagger, {
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

fastify.register(swaggerUi, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

// Root endpoint
fastify.get("/", async () => {
  return {
    name: "Kontaktar API",
    version: "1.0.0",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

// Health check endpoint
fastify.get("/health", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
});

// Register API routes
fastify.register(userRoutes, { prefix: "/api/users" });

// Start server - Vercel will handle this automatically in production
fastify.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });

export default fastify;
