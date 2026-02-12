import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "./server.js";

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: join(__dirname, "../../../.env") });

const PORT = parseInt(process.env.PORT || "5001", 10);
const HOST = process.env.HOST || "0.0.0.0";

async function start() {
  try {
    const server = await createServer();

    // Start listening
    await server.listen({ port: PORT, host: HOST });

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
        await server.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();
