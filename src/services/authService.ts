/**
 * AUTH SERVICE - ChansAyiti
 * 
 * Service d'authentification sécurisé pour les administrateurs.
 * 
 * IMPORTANT : Dans un environnement de production, cette logique
 * doit être implémentée CÔTÉ SERVEUR. Cette version frontend
 * est une simulation pour démonstration uniquement.
 * 
 * Règles de sécurité :
 * - Les mots de passe ne sont JAMAIS stockés en clair
 * - Les sessions expirent après inactivité
 * - Les tentatives de connexion sont limitées
 * - Les erreurs ne révèlent pas d'information sensible
 * - Le rôle ADMIN doit être validé côté serveur
 */

// ============================================================
// TYPES
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'FINANCE' | 'SUPPORT';
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

// ============================================================
// CONFIGURATION DE SÉCURITÉ
// ============================================================

const SECURITY_CONFIG = {
  SESSION_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 12,
  MFA_REQUIRED_FOR_SENSITIVE_OPS: true,
};

// ============================================================
// SIMULATION DE BASE DE DONNÉES (CÔTÉ SERVEUR EN PRODUCTION)
// ============================================================

// En production : ces données seraient dans une base de données sécurisée
// avec des mots de passe hashés (bcrypt/argon2)
const ADMIN_USERS_DB = [
  {
    id: 'admin-001',
    email: 'admin@chansayiti.ht',
    // En production : hash bcrypt du mot de passe
    passwordHash: 'demo-password-123!', // NE JAMAIS UTILISER EN PRODUCTION
    name: 'Marie-Claire Duval',
    role: 'SUPER_ADMIN' as const,
    emailVerified: true,
    lastLogin: null,
    mfaEnabled: false,
  },
  {
    id: 'admin-002',
    email: 'finance@chansayiti.ht',
    passwordHash: 'finance-secure-456!',
    name: 'Jean-Pierre Sylvain',
    role: 'FINANCE' as const,
    emailVerified: true,
    lastLogin: null,
    mfaEnabled: false,
  },
];

// ============================================================
// GESTIONNAIRE D'AUTHENTIFICATION
// ============================================================

class AuthManager {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    session: null,
    error: null,
    isLoading: false,
  };

  private loginAttempts: LoginAttempt[] = [];
  private lockedAccounts: Map<string, number> = new Map();
  private listeners: Set<(state: AuthState) => void> = new Set();

  // Obtenir l'état actuel
  getState(): AuthState {
    return { ...this.state };
  }

  // S'abonner aux changements d'état
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notifier les listeners
  private notify(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  // Vérifier si un compte est verrouillé
  private isAccountLocked(email: string): boolean {
    const lockTime = this.lockedAccounts.get(email);
    if (!lockTime) return false;
    
    if (Date.now() - lockTime > SECURITY_CONFIG.LOCKOUT_DURATION_MS) {
      this.lockedAccounts.delete(email);
      return false;
    }
    
    return true;
  }

  // Enregistrer une tentative de connexion
  private recordLoginAttempt(email: string, success: boolean): void {
    this.loginAttempts.push({
      email,
      timestamp: Date.now(),
      success,
    });

    if (!success) {
      const recentAttempts = this.loginAttempts.filter(
        a => a.email === email && 
             !a.success && 
             Date.now() - a.timestamp < SECURITY_CONFIG.LOCKOUT_DURATION_MS
      );

      if (recentAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        this.lockedAccounts.set(email, Date.now());
      }
    }
  }

  // Générer un token de session
  private generateSessionToken(): string {
    // En production : utiliser crypto.getRandomValues()
    const array = new Uint8Array(32);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Connexion
  async login(params: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Vérifier si le compte est verrouillé
      if (this.isAccountLocked(params.email)) {
        this.state.isLoading = false;
        this.state.error = 'Compte temporairement verrouillé. Réessayez dans 15 minutes.';
        this.notify();
        return { success: false, error: this.state.error };
      }

      // Validation basique
      if (!params.email || !params.password) {
        this.state.isLoading = false;
        this.state.error = 'Veuillez remplir tous les champs.';
        this.notify();
        return { success: false, error: this.state.error };
      }

      // Rechercher l'utilisateur (en production : requête serveur)
      const user = ADMIN_USERS_DB.find(u => u.email === params.email);

      if (!user) {
        this.recordLoginAttempt(params.email, false);
        this.state.isLoading = false;
        // Message générique pour ne pas révéler si l'email existe
        this.state.error = 'Identifiants invalides.';
        this.notify();
        return { success: false, error: this.state.error };
      }

      // Vérifier le mot de passe (en production : bcrypt.compare)
      if (user.passwordHash !== params.password) {
        this.recordLoginAttempt(params.email, false);
        this.state.isLoading = false;
        this.state.error = 'Identifiants invalides.';
        this.notify();
        return { success: false, error: this.state.error };
      }

      // Vérifier que l'email est vérifié
      if (!user.emailVerified) {
        this.state.isLoading = false;
        this.state.error = 'Veuillez vérifier votre adresse e-mail avant de vous connecter.';
        this.notify();
        return { success: false, error: this.state.error };
      }

      // Créer la session
      const session: Session = {
        token: this.generateSessionToken(),
        userId: user.id,
        role: user.role,
        expiresAt: Date.now() + SECURITY_CONFIG.SESSION_DURATION_MS,
        createdAt: Date.now(),
      };

      // Mettre à jour l'état
      this.state = {
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLogin: new Date().toISOString(),
          mfaEnabled: user.mfaEnabled,
        },
        session,
        error: null,
        isLoading: false,
      };

      // Enregistrer la tentative réussie
      this.recordLoginAttempt(params.email, true);

      // Stocker la session (en production : cookie HttpOnly)
      this.persistSession(session);

      this.notify();
      return { success: true };

    } catch (error) {
      this.state.isLoading = false;
      this.state.error = 'Une erreur est survenue. Veuillez réessayer.';
      this.notify();
      return { success: false, error: this.state.error };
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    this.state = {
      isAuthenticated: false,
      user: null,
      session: null,
      error: null,
      isLoading: false,
    };

    // Supprimer la session stockée
    this.clearSession();
    this.notify();
  }

  // Vérifier si la session est valide
  isSessionValid(): boolean {
    if (!this.state.session) return false;
    return Date.now() < this.state.session.expiresAt;
  }

  // Rafraîchir la session
  refreshSession(): boolean {
    if (!this.state.session) return false;
    
    this.state.session.expiresAt = Date.now() + SECURITY_CONFIG.SESSION_DURATION_MS;
    this.persistSession(this.state.session);
    this.notify();
    
    return true;
  }

  // Vérifier les permissions
  hasPermission(requiredRole: string): boolean {
    if (!this.state.isAuthenticated || !this.state.user) return false;
    
    const roleHierarchy = {
      'SUPER_ADMIN': 4,
      'ADMIN': 3,
      'FINANCE': 2,
      'SUPPORT': 1,
    };

    const userLevel = roleHierarchy[this.state.user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  }

  // Persister la session (simulation)
  private persistSession(session: Session): void {
    // En production : cookie HttpOnly, Secure, SameSite
    try {
      sessionStorage.setItem('chansayiti_session', JSON.stringify(session));
    } catch (e) {
      // Ignorer les erreurs de stockage
    }
  }

  // Charger la session persistée
  loadPersistedSession(): boolean {
    try {
      const stored = sessionStorage.getItem('chansayiti_session');
      if (!stored) return false;

      const session: Session = JSON.parse(stored);
      
      // Vérifier l'expiration
      if (Date.now() >= session.expiresAt) {
        this.clearSession();
        return false;
      }

      // Restaurer l'utilisateur
      const user = ADMIN_USERS_DB.find(u => u.id === session.userId);
      if (!user) {
        this.clearSession();
        return false;
      }

      this.state = {
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          mfaEnabled: user.mfaEnabled,
        },
        session,
        error: null,
        isLoading: false,
      };

      this.notify();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Effacer la session
  private clearSession(): void {
    try {
      sessionStorage.removeItem('chansayiti_session');
    } catch (e) {
      // Ignorer
    }
  }

  // Obtenir le token de session
  getSessionToken(): string | null {
    return this.state.session?.token || null;
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): AdminUser | null {
    return this.state.user;
  }
}

// Instance globale
export const authManager = new AuthManager();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

export function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  return authManager.login({ email, password });
}

export function logout(): Promise<void> {
  return authManager.logout();
}

export function getAuthState(): AuthState {
  return authManager.getState();
}

export function isAuthenticated(): boolean {
  return authManager.getState().isAuthenticated && authManager.isSessionValid();
}

export function hasPermission(role: string): boolean {
  return authManager.hasPermission(role);
}

export function getCurrentUser(): AdminUser | null {
  return authManager.getCurrentUser();
}

export function subscribeToAuth(listener: (state: AuthState) => void): () => void {
  return authManager.subscribe(listener);
}

export function loadSession(): boolean {
  return authManager.loadPersistedSession();
}

export function refreshSession(): boolean {
  return authManager.refreshSession();
}

// ============================================================
// HOOKS REACT
// ============================================================

import { useState, useEffect } from 'react';

export function useAuth() {
  const [state, setState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setState);
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
