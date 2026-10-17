import { useEffect, useState } from 'react';

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN' | 'FINANCE' | 'SUPPORT';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  emailVerified: boolean;
  lastLogin: string | null;
  mfaEnabled: boolean;
}

export interface Session {
  token: string;
  userId: string;
  role: string;
  expiresAt: number;
  createdAt: number;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  session: Session | null;
  error: string | null;
  isLoading: boolean;
}

type ApiUser = {
  id: string;
  email: string;
  emailVerified?: boolean;
  role?: string;
  fullName?: string | null;
  lastLoginAt?: string | null;
};

type ApiResult = { success: boolean; error?: string; user?: ApiUser | null };

const PRIVILEGED_ROLES = new Set<AdminRole>(['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'SUPPORT']);
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_REQUEST_TIMEOUT_MS = 10_000;

async function authRequest(action: 'login' | 'session' | 'logout', body?: Record<string, unknown>): Promise<ApiResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`/api/auth?action=${encodeURIComponent(action)}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body === undefined
        ? { Accept: 'application/json' }
        : { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
      signal: controller.signal,
    });
    const payload: unknown = await response.json().catch(() => ({}));
    const data = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
    if (!response.ok) {
      return { success: false, error: typeof data.error === 'string' ? data.error : `Erreur serveur (HTTP ${response.status}).` };
    }
    return {
      success: data.success === true,
      error: typeof data.error === 'string' ? data.error : undefined,
      user: data.user && typeof data.user === 'object' ? data.user as ApiUser : null,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`Admin authentication request timed out: ${action}`);
      return { success: false, error: 'Le serveur met trop de temps à répondre. Veuillez réessayer.' };
    }
    console.error('Admin authentication request failed:', error);
    return { success: false, error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
  } finally {
    window.clearTimeout(timeout);
  }
}

function mapAdminUser(user: ApiUser): AdminUser | null {
  const role = typeof user.role === 'string' ? user.role.toUpperCase() as AdminRole : undefined;
  if (!role || !PRIVILEGED_ROLES.has(role)) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.fullName?.trim() || user.email,
    role,
    emailVerified: user.emailVerified === true,
    lastLogin: user.lastLoginAt ?? null,
    mfaEnabled: false,
  };
}

class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    session: null,
    error: null,
    isLoading: true,
  };
  private listeners = new Set<(state: AuthState) => void>();
  private restorePromise: Promise<boolean> | null = null;

  getState(): AuthState { return { ...this.state }; }
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  private notify(): void { this.listeners.forEach(listener => listener(this.getState())); }

  private setSignedIn(user: AdminUser): void {
    const now = Date.now();
    this.state = {
      isAuthenticated: true,
      user,
      session: { token: 'httponly-cookie', userId: user.id, role: user.role, expiresAt: now + SESSION_DURATION_MS, createdAt: now },
      error: null,
      isLoading: false,
    };
    this.notify();
  }

  async login(params: { email: string; password: string }): Promise<{ success: boolean; error?: string }> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.notify();
    const email = params.email.trim().toLowerCase();
    if (!email || !params.password) {
      this.state = { ...this.state, isLoading: false, error: 'Veuillez remplir tous les champs.' };
      this.notify();
      return { success: false, error: this.state.error ?? undefined };
    }

    const result = await authRequest('login', { email, password: params.password });
    if (!result.success || !result.user) {
      const error = result.error || 'Identifiants invalides.';
      this.state = { ...this.state, isLoading: false, error };
      this.notify();
      return { success: false, error };
    }

    const user = mapAdminUser(result.user);
    if (!user) {
      await authRequest('logout', {});
      this.state = {
        isAuthenticated: false,
        user: null,
        session: null,
        error: 'Ce compte ne dispose pas des droits d’administration.',
        isLoading: false,
      };
      this.notify();
      return { success: false, error: this.state.error ?? undefined };
    }

    this.setSignedIn(user);
    return { success: true };
  }

  async restoreSession(): Promise<boolean> {
    if (this.restorePromise) return this.restorePromise;
    this.state = { ...this.state, isLoading: true, error: null };
    this.notify();
    this.restorePromise = (async () => {
      try {
        const result = await authRequest('session');
        const user = result.success && result.user ? mapAdminUser(result.user) : null;
        if (user) {
          this.setSignedIn(user);
          return true;
        }
        this.state = {
          isAuthenticated: false,
          user: null,
          session: null,
          error: result.error ?? null,
          isLoading: false,
        };
        this.notify();
        return false;
      } catch (error) {
        console.error('Admin session restoration failed:', error);
        this.state = {
          isAuthenticated: false,
          user: null,
          session: null,
          error: 'Impossible de vérifier la session sécurisée.',
          isLoading: false,
        };
        this.notify();
        return false;
      }
    })();
    try { return await this.restorePromise; }
    finally { this.restorePromise = null; }
  }

  async logout(): Promise<void> {
    await authRequest('logout', {});
    this.state = { isAuthenticated: false, user: null, session: null, error: null, isLoading: false };
    this.notify();
  }

  isSessionValid(): boolean {
    return this.state.isAuthenticated && this.state.session !== null && Date.now() < this.state.session.expiresAt;
  }

  hasPermission(requiredRole: string): boolean {
    if (!this.state.isAuthenticated || !this.state.user) return false;
    const levels: Record<string, number> = { SUPER_ADMIN: 4, ADMIN: 3, FINANCE: 2, SUPPORT: 1 };
    return (levels[this.state.user.role] ?? 0) >= (levels[requiredRole.toUpperCase()] ?? Number.POSITIVE_INFINITY);
  }

  getSessionToken(): string | null { return this.state.session ? 'httponly-cookie' : null; }
  getCurrentUser(): AdminUser | null { return this.state.user; }
}

export const authManager = new AuthManager();

export function login(email: string, password: string) { return authManager.login({ email, password }); }
export function logout() { return authManager.logout(); }
export function getAuthState() { return authManager.getState(); }
export function isAuthenticated() { return authManager.isSessionValid(); }
export function hasPermission(role: string) { return authManager.hasPermission(role); }
export function getCurrentUser() { return authManager.getCurrentUser(); }
export function subscribeToAuth(listener: (state: AuthState) => void) { return authManager.subscribe(listener); }
export function loadSession(): boolean { void authManager.restoreSession(); return false; }
export function restoreAdminSession(): Promise<boolean> { return authManager.restoreSession(); }
export function refreshSession(): boolean { return authManager.isSessionValid(); }

export function useAuth() {
  const [state, setState] = useState<AuthState>(authManager.getState());
  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
    void authManager.restoreSession();
    return unsubscribe;
  }, []);
  return {
    ...state,
    login,
    logout,
    checkAuth: isAuthenticated,
    hasPermission,
  };
}
