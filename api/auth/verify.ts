// Explicit Vercel route for /api/auth/verify.
// Keep all authentication logic centralized in the shared handler.
// Use the emitted .js extension so the Node.js ESM runtime can resolve the
// sibling Vercel function after TypeScript transpilation.
import handler from './[action].js';

export default handler;
