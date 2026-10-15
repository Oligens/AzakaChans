/**
 * Authentification utilisateur AZAKA CHANS.
 * Les comptes, profils, portefeuilles et sessions sont conservés dans Neon.
 * Le cookie de session est HttpOnly : aucun token d'authentification dans localStorage.
 */
export type UserRole = 'USER' | 'SUPPORT' | 'FINANCE' | 'ADMIN' | 'SUPER_ADMIN';
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
  fullName?: string | null;
}
export interface AuthState { isAuthenticated: boolean; user: User | null; sessionToken: string | null }
type AuthResult = { success: boolean; error?: string; userId?: string; user?: User };

// API gateways and database drivers may return structured errors such as
// { code, message }. Never pass an object to React as renderable text.
function normalizeError(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') {
    const error = value as { message?: unknown; error?: unknown; code?: unknown };
    if (typeof error.message === 'string' && error.message.trim()) return error.message;
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (error.error && typeof error.error === 'object') return normalizeError(error.error, fallback);
    if (typeof error.code === 'string' && error.code.trim()) return `${fallback} (code: ${error.code})`;
  }
  return fallback;
}
let currentAuthState: AuthState = { isAuthenticated: false, user: null, sessionToken: null };
const observers: ((state: AuthState) => void)[] = [];
let restorePromise: Promise<boolean> | null = null;
function notifyObservers() { observers.forEach(observer => observer(currentAuthState)); }
export function subscribeToAuth(observer: (state: AuthState) => void): () => void {
  observers.push(observer);
  return () => { const index = observers.indexOf(observer); if (index >= 0) observers.splice(index, 1); };
}
export function getAuthState(): AuthState { return currentAuthState; }
async function request(action: string, body?: Record<string, unknown>): Promise<AuthResult> {
  try {
    const response = await fetch(`/api/auth/${action}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    const result = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    const fallback = `Erreur serveur (HTTP ${response.status})`;
    if (!response.ok) return { success: false, error: normalizeError(result.error ?? result.message, fallback) };
    return {
      success: result.success === true,
      error: result.error === undefined ? undefined : normalizeError(result.error, 'Une erreur est survenue.'),
      userId: typeof result.userId === 'string' ? result.userId : undefined,
      user: result.user && typeof result.user === 'object' ? result.user as User : undefined,
    };
  } catch (error) {
    console.error('Auth request failed:', error);
    return { success: false, error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
  }
}
export async function registerUser(email: string, password: string): Promise<AuthResult> {
  return request('register', { email: email.trim().toLowerCase(), password });
}
export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  return request('verify', { email: email.trim().toLowerCase(), code });
}
export async function resendVerificationCode(email: string): Promise<AuthResult> {
  return request('resend', { email: email.trim().toLowerCase() });
}
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const result = await request('login', { email: email.trim().toLowerCase(), password });
  if (result.success && result.user) {
    currentAuthState = { isAuthenticated: true, user: result.user, sessionToken: null };
    notifyObservers();
  }
  return result;
}
export async function logoutUser(): Promise<void> {
  await request('logout', {});
  currentAuthState = { isAuthenticated: false, user: null, sessionToken: null };
  notifyObservers();
}
export async function restoreSession(): Promise<boolean> {
  if (restorePromise) return restorePromise;
  restorePromise = (async () => {
    const result = await request('session');
    currentAuthState = result.success && result.user
      ? { isAuthenticated: true, user: result.user, sessionToken: null }
      : { isAuthenticated: false, user: null, sessionToken: null };
    notifyObservers();
    return currentAuthState.isAuthenticated;
  })();
  try { return await restorePromise; } finally { restorePromise = null; }
}
export function isAuthenticated(): boolean { return currentAuthState.isAuthenticated; }
export function getCurrentUser(): User | null { return currentAuthState.user; }
