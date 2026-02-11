import dotenv from "dotenv";
import path from "path";
import { log } from "@repo/logger";
import { createServer } from "./server";

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const port = process.env.PORT || 5001;

async function startServer() {
  try {
    const server = await createServer();

    await server.listen({ port: Number(port), host: "0.0.0.0" });

    log(`API server running on http://localhost:${port}`);
    log(
      `Swagger documentation available at http://localhost:${port}/documentation`,
    );
  } catch (err) {
    log("Failed to start server:", err);
    process.exit(1);
  }
}

// Start the server
startServer();
