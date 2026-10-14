/**
 * USER AUTH SERVICE - AZAKA CHANS
 * 
 * Service d'authentification pour les utilisateurs (non-admin)
 * Gère l'inscription, la vérification email et la connexion
 */

import { hashPassword, verifyPassword, generateRandomString } from './cryptoService';

// Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  emailVerified: boolean;
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

// Base de données simulée (en production : base de données réelle)
const usersDB: Map<string, User> = new Map();

// État d'authentification
let currentAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  sessionToken: null
};

// Observateurs d'état
const observers: ((state: AuthState) => void)[] = [];

/**
 * Notifie tous les observateurs du changement d'état
 */
function notifyObservers() {
  observers.forEach(observer => observer(currentAuthState));
}

/**
 * S'abonne aux changements d'état d'authentification
 */
export function subscribeToAuth(observer: (state: AuthState) => void): () => void {
  observers.push(observer);
  return () => {
    const index = observers.indexOf(observer);
    if (index > -1) observers.splice(index, 1);
  };
}

/**
 * Obtient l'état actuel de l'authentification
 */
export function getAuthState(): AuthState {
  return currentAuthState;
}

/**
 * Génère un code de vérification à 6 chiffres
 */
function generateVerificationCode(): string {
  // Utilise crypto.getRandomValues pour une génération sécurisée
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 900000 + 100000).toString(); // Code entre 100000 et 999999
  return code;
}

/**
 * Simule l'envoi d'un email
 * En production : utiliser un service d'email réel (SendGrid, Mailgun, etc.)
 */
async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  // Simulation de l'envoi d'email
  console.log(`[EMAIL SIMULATION] Envoi du code ${code} à ${email}`);
  
  // En production, ici on appellerait un service d'email
  // const response = await fetch('/api/send-verification-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, code })
  // });
  // return response.ok;
  
  // Pour la démo, on simule un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function registerUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Adresse email invalide' };
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
    }

    // Vérifier si l'email existe déjà
    const normalizedEmail = email.toLowerCase().trim();
    if (usersDB.has(normalizedEmail)) {
      return { success: false, error: 'Cette adresse email est déjà associée à un compte' };
    }

    // Hasher le mot de passe
    const { hash, salt } = await hashPassword(password);

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Créer l'utilisateur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      verificationCode,
      verificationCodeExpiry,
      verificationAttempts: 0
    };

    // Sauvegarder dans la base de données
    usersDB.set(normalizedEmail, newUser);

    // Envoyer l'email de vérification
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);
    
    if (!emailSent) {
      // Si l'envoi échoue, on supprime l'utilisateur
      usersDB.delete(normalizedEmail);
      return { success: false, error: 'Impossible d\'envoyer l\'email de vérification' };
    }

    return { success: true, userId };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
  }
}

/**
 * Vérifie le code de vérification email
 */
export async function verifyEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return { success: false, error: 'Cet email est déjà vérifié' };
    }

    // Vérifier le nombre de tentatives
    if (user.verificationAttempts && user.verificationAttempts >= 5) {
      return { success: false, error: 'Trop de tentatives. Veuillez demander un nouveau code' };
    }

    // Vérifier l'expiration du code
    if (user.verificationCodeExpiry && Date.now() > user.verificationCodeExpiry) {
      return { success: false, error: 'Code expiré. Veuillez demander un nouveau code' };
    }

    // Vérifier le code
    if (user.verificationCode !== code) {
      // Incrémenter le nombre de tentatives
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      usersDB.set(normalizedEmail, user);
      
      const remainingAttempts = 5 - user.verificationAttempts;
      if (remainingAttempts > 0) {
        return { success: false, error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s)` };
      } else {
        return { success: false, error: 'Trop de tentatives. Veuillez demander un nouveau code' };
      }
    }

    // Code correct : vérifier l'email
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

/**
 * Renvoie un code de vérification
 */
export async function resendVerificationCode(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);

    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Cet email est déjà vérifié' };
    }

    // Générer un nouveau code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Mettre à jour l'utilisateur
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;
    user.verificationAttempts = 0;
    usersDB.set(normalizedEmail, user);

    // Envoyer le nouvel email
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationCode);
    
    if (!emailSent) {
      return { success: false, error: 'Impossible d\'envoyer l\'email de vérification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors du renvoi du code:', error);
    return { success: false, error: 'Une erreur est survenue' };
  }
}

/**
 * Connecte un utilisateur
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = usersDB.get(normalizedEmail);

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    
    if (!isValid) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      return { success: false, error: 'Veuillez vérifier votre adresse email avant de vous connecter' };
    }

    // Mettre à jour la dernière connexion
    user.lastLoginAt = new Date().toISOString();
    usersDB.set(normalizedEmail, user);

    // Créer une session
    const sessionToken = generateRandomString(32);
    
    currentAuthState = {
      isAuthenticated: true,
      user: { ...user },
      sessionToken
    };

    // Sauvegarder la session dans le localStorage
    localStorage.setItem('azaka_chans_session', JSON.stringify({
      userId: user.id,
      email: user.email,
      sessionToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 heures
    }));

    notifyObservers();

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return { success: false, error: 'Une erreur est survenue lors de la connexion' };
  }
}

/**
 * Déconnecte l'utilisateur
 */
export function logoutUser(): void {
  currentAuthState = {
    isAuthenticated: false,
    user: null,
    sessionToken: null
  };

  localStorage.removeItem('azaka_chans_session');
  notifyObservers();
}

/**
 * Restaure la session depuis le localStorage
 */
export function restoreSession(): boolean {
  try {
    const sessionData = localStorage.getItem('azaka_chans_session');
    
    if (!sessionData) {
      return false;
    }

    const { userId, email, sessionToken, expiresAt } = JSON.parse(sessionData);

    // Vérifier l'expiration
    if (Date.now() > expiresAt) {
      localStorage.removeItem('azaka_chans_session');
      return false;
    }

    // Récupérer l'utilisateur
    const user = usersDB.get(email);
    
    if (!user || user.id !== userId) {
      localStorage.removeItem('azaka_chans_session');
      return false;
    }

    currentAuthState = {
      isAuthenticated: true,
      user: { ...user },
      sessionToken
    };

    notifyObservers();
    return true;
  } catch (error) {
    console.error('Erreur lors de la restauration de la session:', error);
    localStorage.removeItem('azaka_chans_session');
    return false;
  }
}

/**
 * Vérifie si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return currentAuthState.isAuthenticated;
}

/**
 * Obtient l'utilisateur actuel
 */
export function getCurrentUser(): User | null {
  return currentAuthState.user;
}

/**
 * Obtient les informations de l'utilisateur par email (pour la vérification)
 */
export function getUserByEmail(email: string): User | null {
  const normalizedEmail = email.toLowerCase().trim();
  return usersDB.get(normalizedEmail) || null;
}
