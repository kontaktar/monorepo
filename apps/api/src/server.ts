import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

// Import routes
import userRoutes from "./routes/users.js";

console.log("🚀 Initializing Fastify server...");
console.log("Environment:", {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
});

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

// Async setup function
async function setupServer() {
  console.log("📡 Registering CORS...");
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });
  console.log("✅ CORS registered");

  console.log("📚 Registering Swagger...");
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
  console.log("✅ Swagger registered");

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

  console.log("🔌 Registering routes...");
  await fastify.register(userRoutes, { prefix: "/api/users" });
  console.log("✅ Routes registered");

  await fastify.ready();
  console.log("✅ Server setup complete");
}

// Setup and start server
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;

if (!isVercel) {
  // Running locally - setup and listen
  console.log("🏠 Running locally - starting server...");
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HOST || "0.0.0.0";

  setupServer()
    .then(() => {
      return fastify.listen({ port: PORT, host: HOST });
    })
    .catch((err) => {
      fastify.log.error(err);
      process.exit(1);
    });
} else {
  // Running on Vercel - just setup, don't listen
  console.log("☁️  Running on Vercel - setting up server...");
  setupServer().catch((err) => {
    console.error("Error setting up server:", err);
    throw err;
  });
}

// Export for Vercel and tests
export default fastify;
