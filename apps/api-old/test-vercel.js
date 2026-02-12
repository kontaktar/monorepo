// Simulate Vercel environment
process.env.VERCEL = '1';
process.env.VERCEL_ENV = 'production';
process.env.NODE_ENV = 'production';

console.log('Testing server in Vercel mode...');
import('./src/server.js').then(() => {
  console.log('Server module loaded successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('Error loading server:', err);
  process.exit(1);
});
