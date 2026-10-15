/**
 * USER AUTH SERVICE - AZAKA CHANS
 *
 * Service d'authentification pour les utilisateurs (non-admin)
 * Gère l'inscription, la vérification email et la connexion
 */

import { hashPassword, verifyPassword, generateRandomString } from './cryptoService';

export type UserRole = 'USER' | 'SUPPORT' | 'FINANCE' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
  verificationCode?: string;
  verificationCodeExpiry?: number;
  verificationAttempts?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionToken: string | null;
}

const usersDB: Map<string, User> = new Map();
let currentAuthState: AuthState = { isAuthenticated: false, user: null, sessionToken: null };
const observers: ((state: AuthState) => void)[] = [];

function notifyObservers() {
  observers.forEach(observer => observer(currentAuthState));
}

export function subscribeToAuth(observer: (state: AuthState) => void): () => void {
  observers.push(observer);
  return () => {
    const index = observers.indexOf(observer);
    if (index > -1) observers.splice(index, 1);
  };
}

export function getAuthState(): AuthState {
  return currentAuthState;
}

function generateVerificationCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % 900000 + 100000).toString();
}

/** Sends the generated verification code through the server-side Gmail SMTP endpoint. */
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      console.error('Verification email delivery failed:', payload?.error || `HTTP ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Verification email request failed:', error);
    return false;
  }
}

export async function registerUser(email: string, password: string): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { success: false, error: 'Adresse email invalide' };
    if (password.length < 8) return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };

    const normalizedEmail = email.toLowerCase().trim();
    if (usersDB.has(normalizedEmail)) return { success: false, error: 'Cette adresse email est déjà associée à un compte' };

    const { hash, salt } = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = Date.now() + 10 * 60 * 1000;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: false,
      role: 'USER',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      verificationCode,
      verificationCodeExpiry,
      verificationAttempts: 0
    };

    usersDB.set(normalizedEmail, newUser);
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);
    if (!emailSent) {
      usersDB.delete(normalizedEmail);
      return { success: false, error: 'Impossible d\'envoyer l\'email de vérification. Vérifiez la configuration email du serveur.' };
    }

    return { success: true, userId };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
  }
}

export async function verifyEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);
    if (!user) return { success: false, error: 'Utilisateur non trouvé' };
    if (user.emailVerified) return { success: false, error: 'Cet email est déjà vérifié' };
    if (user.verificationAttempts && user.verificationAttempts >= 5) return { success: false, error: 'Trop de tentatives. Veuillez demander un nouveau code' };
    if (user.verificationCodeExpiry && Date.now() > user.verificationCodeExpiry) return { success: false, error: 'Code expiré. Veuillez demander un nouveau code' };

    if (user.verificationCode !== code) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      usersDB.set(normalizedEmail, user);
      const remainingAttempts = 5 - user.verificationAttempts;
      return remainingAttempts > 0
        ? { success: false, error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s)` }
        : { success: false, error: 'Trop de tentatives. Veuillez demander un nouveau code' };
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    user.verificationAttempts = undefined;
    usersDB.set(normalizedEmail, user);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return { success: false, error: 'Une erreur est survenue lors de la vérification' };
  }
}

export async function resendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);
    if (!user) return { success: false, error: 'Utilisateur non trouvé' };
    if (user.emailVerified) return { success: false, error: 'Cet email est déjà vérifié' };

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000;
    user.verificationAttempts = 0;
    usersDB.set(normalizedEmail, user);

    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);
    if (!emailSent) return { success: false, error: 'Impossible d\'envoyer l\'email de vérification' };
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du renvoi du code:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);
    if (!user) return { success: false, error: 'Email ou mot de passe incorrect' };
    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) return { success: false, error: 'Email ou mot de passe incorrect' };
    if (!user.emailVerified) return { success: false, error: 'Veuillez vérifier votre adresse email avant de vous connecter' };

    user.lastLoginAt = new Date().toISOString();
    usersDB.set(normalizedEmail, user);
    const sessionToken = generateRandomString(32);
    currentAuthState = { isAuthenticated: true, user: { ...user }, sessionToken };
    localStorage.setItem('azaka_chans_session', JSON.stringify({ userId: user.id, email: user.email, sessionToken, expiresAt: Date.now() + 24 * 60 * 60 * 1000 }));
    notifyObservers();
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return { success: false, error: 'Une erreur est survenue lors de la connexion' };
  }
}

export function logoutUser(): void {
  currentAuthState = { isAuthenticated: false, user: null, sessionToken: null };
  localStorage.removeItem('azaka_chans_session');
  notifyObservers();
}

export function restoreSession(): boolean {
  try {
    const sessionData = localStorage.getItem('azaka_chans_session');
    if (!sessionData) return false;
    const { userId, email, sessionToken, expiresAt } = JSON.parse(sessionData);
    if (Date.now() > expiresAt) {
      localStorage.removeItem('azaka_chans_session');
      return false;
    }
    const user = usersDB.get(email);
    if (!user || user.id !== userId) {
      localStorage.removeItem('azaka_chans_session');
      return false;
    }
    currentAuthState = { isAuthenticated: true, user: { ...user }, sessionToken };
    notifyObservers();
    return true;
  } catch (error) {
    console.error('Erreur lors de la restauration de la session:', error);
    localStorage.removeItem('azaka_chans_session');
    return false;
  }
}

export function isAuthenticated(): boolean { return currentAuthState.isAuthenticated; }
export function getCurrentUser(): User | null { return currentAuthState.user; }
export function getUserByEmail(email: string): User | null {
  return usersDB.get(email.toLowerCase().trim()) || null;
}
