// Explicit Vercel route for /api/auth/logout.
// Keep all authentication logic centralized in the shared handler.
import handler from './[action]';

export default handler;
