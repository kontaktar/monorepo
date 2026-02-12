import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: join(__dirname, "../../../.env") });

// Set defaults for local development
process.env.PORT = process.env.PORT || "5001";
process.env.HOST = process.env.HOST || "0.0.0.0";

const PORT = process.env.PORT;
const HOST = process.env.HOST;

// Import the server (this will start it automatically)
const { default: fastify } = await import("../server.js");

console.log(`
🚀 Server ready at: http://localhost:${PORT}
📚 Documentation: http://localhost:${PORT}/documentation
🏥 Health check: http://localhost:${PORT}/health
`);

// Graceful shutdown
const signals = ["SIGINT", "SIGTERM"];
for (const signal of signals) {
  process.on(signal, async () => {
    console.log(`\n${signal} received, closing server...`);
    await fastify.close();
    process.exit(0);
  });
}
