// Explicit Vercel route for /api/auth/login.
// Keep all authentication logic centralized in the shared handler.
import handler from './[action]';

export default handler;
