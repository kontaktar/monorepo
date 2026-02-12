import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { IncomingMessage, ServerResponse } from "http";

// Import routes
import userRoutes from "./routes/users.js";

export async function createServer(): Promise<FastifyInstance> {
  const server = Fastify({
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
  await server.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  // Register Swagger
  await server.register(swagger, {
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

  await server.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // Root endpoint
  server.get("/", {
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
  server.get("/health", {
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
  await server.register(userRoutes, { prefix: "/api/users" });

  return server;
}

// Vercel serverless handler
let serverInstance: FastifyInstance | null = null;

export async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!serverInstance) {
    serverInstance = await createServer();
    await serverInstance.ready();
  }

  serverInstance.server.emit("request", req, res);
}
