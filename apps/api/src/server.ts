import { log } from "@repo/logger";
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

// Import routes
import userRoutes from "./routes/users";

export async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: true,
    trustProxy: true,
  });

  // Register plugins
  await server.register(cors, {
    origin: true, // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  // Swagger documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: "Kontaktar API",
        description: "API for Kontaktar service marketplace",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:5001",
          description: "Development server",
        },
      ],
    },
  });

  await server.register(swaggerUi, {
    routePrefix: "/documentation",
  });

  // Register routes
  server.register(userRoutes, { prefix: "/api/users" });

  // Basic status endpoint
  server.get("/status", {
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
          },
        },
      },
    },
    handler: async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
  });

  // Log when server is ready
  server.addHook("onReady", () => {
    log(`Server is ready`);
  });

  return server;
}
