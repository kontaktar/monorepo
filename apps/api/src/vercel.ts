import fastify from 'fastify';
import { createServer } from './server';

// Export a function for Vercel to use as serverless function
export default async function (req: any, res: any) {
  // Create the Fastify server but don't start listening
  const server = await createServer();

  // Handle the request using Fastify's serverless mode
  server.ready((err) => {
    if (err) {
      console.error('Server initialization error:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
      return;
    }

    // Route the request to the Fastify server
    server.server.emit('request', req, res);
  });
}
