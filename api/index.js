// Vercel serverless function entry point
// This imports the Fastify server handler from the compiled build

let handlerPromise = null;

module.exports = async (req, res) => {
  try {
    // Lazy load the handler (ESM import)
    if (!handlerPromise) {
      handlerPromise = import("../apps/api/dist/server.js").then(
        (mod) => mod.handler,
      );
    }

    const handler = await handlerPromise;
    await handler(req, res);
  } catch (error) {
    console.error("Error in API handler:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
    );
  }
};
