/**
 * AUTHORIZATION SERVICE - AZAKA CHANS
 * 
 * Service d'autorisation et de vérification d'accès aux ressources.
 * Garantit l'isolation stricte des données entre utilisateurs.
 * 
 * SÉCURITÉ:
 * - Vérifie que l'utilisateur est authentifié
 * - Vérifie que l'utilisateur est propriétaire de la ressource
 * - Empêche l'accès aux données d'autres utilisateurs
 * - Fournit des messages d'erreur appropriés
 */

import { getCurrentUser } from './userAuthService';
import { mockTickets, mockWallets, mockWithdrawals } from '../data';

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  return user !== null;
}

/**
 * Récupère l'ID de l'utilisateur connecté
 * Lance une erreur si non authentifié
 */
export function requireUserId(): string {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('AUTHORIZATION_ERROR: Utilisateur non authentifié');
  }
  return user.id;
}

/**
 * Vérifie si l'utilisateur a accès à un ticket
 * SÉCURITÉ: Empêche l'accès aux tickets d'autres utilisateurs
 */
export function canAccessTicket(ticketId: string): { allowed: boolean; error?: string } {
  try {
    const userId = requireUserId();
    
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { allowed: false, error: 'TICKET_NOT_FOUND: Ticket non trouvé' };
    }
    
    // ISOLATION: Vérifier que le ticket appartient à l'utilisateur
    if (ticket.ownerId !== userId) {
      return { allowed: false, error: 'ACCESS_DENIED: Ce ticket ne vous appartient pas' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur a accès à un portefeuille
 * SÉCURITÉ: Empêche l'accès aux portefeuilles d'autres utilisateurs
 */
export function canAccessWallet(userId: string): { allowed: boolean; error?: string } {
  try {
    const authenticatedUserId = requireUserId();
    
    // ISOLATION: Vérifier que l'utilisateur accède à son propre portefeuille
    if (userId !== authenticatedUserId) {
      return { allowed: false, error: 'ACCESS_DENIED: Accès au portefeuille refusé' };
    }
    
    const wallet = mockWallets[userId];
    if (!wallet) {
      return { allowed: false, error: 'WALLET_NOT_FOUND: Portefeuille non trouvé' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur a accès à un retrait
 * SÉCURITÉ: Empêche l'accès aux retraits d'autres utilisateurs
 */
export function canAccessWithdrawal(withdrawalId: string): { allowed: boolean; error?: string } {
  try {
    const userId = requireUserId();
    
    const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) {
      return { allowed: false, error: 'WITHDRAWAL_NOT_FOUND: Retrait non trouvé' };
    }
    
    // ISOLATION: Vérifier que le retrait appartient à l'utilisateur
    if (withdrawal.userId !== userId) {
      return { allowed: false, error: 'ACCESS_DENIED: Ce retrait ne vous appartient pas' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur peut révéler un ticket
 * SÉCURITÉ: Vérifie l'authentification, la propriété et le statut
 */
export function canRevealTicket(ticketId: string): { allowed: boolean; error?: string } {
  try {
    const userId = requireUserId();
    
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { allowed: false, error: 'TICKET_NOT_FOUND: Ticket non trouvé' };
    }
    
    // ISOLATION: Vérifier que le ticket appartient à l'utilisateur
    if (ticket.ownerId !== userId) {
      return { allowed: false, error: 'ACCESS_DENIED: Ce ticket ne vous appartient pas' };
    }
    
    // Vérifier le statut du ticket
    if (ticket.status === 'REVEALED') {
      return { allowed: false, error: 'ALREADY_REVEALED: Ce ticket a déjà été révélé' };
    }
    
    if (ticket.status === 'REDEEMED') {
      return { allowed: false, error: 'ALREADY_REDEEMED: Ce ticket a déjà été encaissé' };
    }
    
    if (ticket.status !== 'SOLD') {
      return { allowed: false, error: 'INVALID_STATUS: Statut du ticket invalide' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur peut effectuer un retrait
 * SÉCURITÉ: Vérifie l'authentification et le solde
 */
export function canWithdraw(amount: number): { allowed: boolean; error?: string } {
  try {
    const userId = requireUserId();
    
    // Validation du montant
    if (amount <= 0) {
      return { allowed: false, error: 'INVALID_AMOUNT: Le montant doit être supérieur à 0' };
    }
    
    // Vérifier le portefeuille
    const wallet = mockWallets[userId];
    if (!wallet) {
      return { allowed: false, error: 'WALLET_NOT_FOUND: Portefeuille non trouvé' };
    }
    
    // Vérifier le solde disponible
    if (amount > wallet.balance) {
      return { allowed: false, error: 'INSUFFICIENT_BALANCE: Solde insuffisant' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur peut acheter un ticket
 * SÉCURITÉ: Vérifie l'authentification, le solde et l'email vérifié
 */
export function canPurchaseTicket(ticketPrice: number): { allowed: boolean; error?: string } {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
    }
    
    // Vérifier que l'email est vérifié
    if (!user.emailVerified) {
      return { allowed: false, error: 'EMAIL_NOT_VERIFIED: Veuillez vérifier votre adresse email' };
    }
    
    const userId = user.id;
    
    // Validation du prix
    if (ticketPrice <= 0) {
      return { allowed: false, error: 'INVALID_PRICE: Prix du ticket invalide' };
    }
    
    // Vérifier le portefeuille
    const wallet = mockWallets[userId];
    if (!wallet) {
      return { allowed: false, error: 'WALLET_NOT_FOUND: Portefeuille non trouvé' };
    }
    
    // Vérifier le solde disponible
    if (ticketPrice > wallet.balance) {
      return { allowed: false, error: 'INSUFFICIENT_BALANCE: Solde insuffisant pour acheter ce ticket' };
    }
    
    return { allowed: true };
  } catch (error) {
    return { allowed: false, error: 'AUTHORIZATION_ERROR: Authentification requise' };
  }
}

/**
 * Vérifie si l'utilisateur est administrateur
 * SÉCURITÉ: Vérifie le rôle de l'utilisateur
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

/**
 * Vérifie si l'utilisateur est super administrateur
 * SÉCURITÉ: Vérifie le rôle de l'utilisateur
 */
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.role === 'SUPER_ADMIN';
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * SÉCURITÉ: Vérifie le rôle de l'utilisateur
 */
export function hasRole(requiredRole: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy: Record<string, number> = {
    'USER': 1,
    'SUPPORT': 2,
    'FINANCE': 3,
    'ADMIN': 4,
    'SUPER_ADMIN': 5,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}
