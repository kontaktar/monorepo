// Vercel serverless function catch-all route
// This file handles all API requests and forwards them to the Fastify server

const handler = require("../apps/api/dist/vercel.cjs");

module.exports = async (req, res) => {
  try {
    // Forward the request to the Fastify handler
    // The handler is exported directly, not as a default export
    await handler(req, res);
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
