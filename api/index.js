// Simple root API route for testing
const handler = require("../apps/api/dist/vercel.cjs");

module.exports = async (req, res) => {
  try {
    // Forward the request to the Fastify handler
    await handler(req, res);
  } catch (error) {
    console.error("Error in API handler:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
