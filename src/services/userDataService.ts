/**
 * USER DATA SERVICE - AZAKA CHANS
 * 
 * Service qui fournit des données cohérentes pour l'utilisateur connecté.
 * Utilise les données mock comme source de vérité et calcule les agrégats
 * de manière cohérente entre le portefeuille et les tickets.
 */

import { mockWallets, mockTickets, mockTransactions, mockWithdrawals } from '../data';
import { Ticket, Transaction } from '../types';
import { WithdrawalRequest } from '../engine/types';

// ID de l'utilisateur connecté (en production: venir de l'auth)
const CURRENT_USER_ID = 'u1';

// ============================================================
// TYPES
// ============================================================

export interface UserWalletData {
  balance: number;
  totalDeposits: number;
  totalWinnings: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  availableForWithdrawal: number;
}

export interface UserTicketsData {
  tickets: Ticket[];
  totalTickets: number;
  ticketsToReveal: number;
  revealedTickets: number;
  redeemedTickets: number;
  totalWinnings: number;
  pendingWinnings: number;
  redeemedWinnings: number;
}

export interface UserTransactionsData {
  transactions: Transaction[];
  totalDeposits: number;
  totalWithdrawals: number;
  totalPurchases: number;
  totalWinnings: number;
}

// ============================================================
// FONCTIONS PRINCIPALES
// ============================================================

/**
 * Obtenir les données du portefeuille de l'utilisateur
 * Calculées à partir des transactions réelles
 */
export function getUserWalletData(): UserWalletData {
  const wallet = mockWallets[CURRENT_USER_ID];
  if (!wallet) {
    return {
      balance: 0,
      totalDeposits: 0,
      totalWinnings: 0,
      totalWithdrawals: 0,
      pendingWithdrawals: 0,
      availableForWithdrawal: 0,
    };
  }

  // Calculer les retraits en attente
  const userWithdrawals = mockWithdrawals.filter(
    w => w.userId === CURRENT_USER_ID && 
         (w.status === 'REQUESTED' || w.status === 'VALIDATED' || w.status === 'PROCESSING')
  );
  const pendingWithdrawals = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Calculer le solde disponible (balance - retraits en attente)
  const availableForWithdrawal = wallet.balance - pendingWithdrawals;

  return {
    balance: wallet.balance,
    totalDeposits: wallet.totalDeposits,
    totalWinnings: wallet.totalWinnings,
    totalWithdrawals: wallet.totalWithdrawals,
    pendingWithdrawals,
    availableForWithdrawal: Math.max(0, availableForWithdrawal),
  };
}

/**
 * Obtenir les données des tickets de l'utilisateur
 * Filtrées et agrégées de manière cohérente
 */
export function getUserTicketsData(): UserTicketsData {
  // Filtrer les tickets de l'utilisateur
  const userTickets = mockTickets.filter(t => t.ownerId === CURRENT_USER_ID);

  // Calculer les statistiques
  const ticketsToReveal = userTickets.filter(t => t.status === 'SOLD').length;
  const revealedTickets = userTickets.filter(t => t.status === 'REVEALED').length;
  const redeemedTickets = userTickets.filter(t => t.status === 'REDEEMED').length;

  // Calculer les gains par statut
  const totalWinnings = userTickets
    .filter(t => t.prizeAmount !== null)
    .reduce((sum, t) => sum + (t.prizeAmount || 0), 0);

  const pendingWinnings = userTickets
    .filter(t => t.status === 'REVEALED' && t.prizeAmount !== null)
    .reduce((sum, t) => sum + (t.prizeAmount || 0), 0);

  const redeemedWinnings = userTickets
    .filter(t => t.status === 'REDEEMED' && t.prizeAmount !== null)
    .reduce((sum, t) => sum + (t.prizeAmount || 0), 0);

  return {
    tickets: userTickets,
    totalTickets: userTickets.length,
    ticketsToReveal,
    revealedTickets,
    redeemedTickets,
    totalWinnings,
    pendingWinnings,
    redeemedWinnings,
  };
}

/**
 * Obtenir les transactions de l'utilisateur
 */
export function getUserTransactionsData(): UserTransactionsData {
  // Filtrer les transactions de l'utilisateur
  const userTransactions = mockTransactions.filter(
    t => t.debitAccount === `${CURRENT_USER_ID}-wallet` || 
         t.creditAccount === `${CURRENT_USER_ID}-wallet`
  );

  // Calculer les agrégats
  const totalDeposits = userTransactions
    .filter(t => t.creditAccount === `${CURRENT_USER_ID}-wallet` && t.type === 'DEPOSIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = userTransactions
    .filter(t => t.debitAccount === `${CURRENT_USER_ID}-wallet` && t.type === 'WITHDRAWAL_REQUEST')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPurchases = userTransactions
    .filter(t => t.debitAccount === `${CURRENT_USER_ID}-wallet` && t.type === 'TICKET_PURCHASE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWinnings = userTransactions
    .filter(t => t.creditAccount === `${CURRENT_USER_ID}-wallet` && t.type === 'WIN_CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions: userTransactions,
    totalDeposits,
    totalWithdrawals,
    totalPurchases,
    totalWinnings,
  };
}

/**
 * Obtenir les retraits de l'utilisateur
 */
export function getUserWithdrawals(): WithdrawalRequest[] {
  return mockWithdrawals.filter(w => w.userId === CURRENT_USER_ID);
}

/**
 * Vérifier la cohérence entre le portefeuille et les tickets
 * Retourne true si les données sont cohérentes
 */
export function verifyDataConsistency(): { isConsistent: boolean; issues: string[] } {
  const walletData = getUserWalletData();
  const ticketsData = getUserTicketsData();
  const transactionsData = getUserTransactionsData();

  const issues: string[] = [];

  // Vérifier que les gains totaux correspondent
  if (walletData.totalWinnings !== ticketsData.totalWinnings) {
    issues.push(
      `Incohérence des gains: Portefeuille=${walletData.totalWinnings}, Tickets=${ticketsData.totalWinnings}`
    );
  }

  // Vérifier que le solde est cohérent avec les transactions
  const expectedBalance = 
    walletData.totalDeposits + 
    walletData.totalWinnings - 
    walletData.totalWithdrawals - 
    transactionsData.totalPurchases;

  if (Math.abs(walletData.balance - expectedBalance) > 1) {
    issues.push(
      `Solde incohérent: Actuel=${walletData.balance}, Attendu=${expectedBalance}`
    );
  }

  return {
    isConsistent: issues.length === 0,
    issues,
  };
}

/**
 * Révéler un ticket (simulation)
 * En production: appeler l'API backend
 */
export function revealTicket(ticketId: string): { success: boolean; ticket?: Ticket; error?: string } {
  const ticket = mockTickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    return { success: false, error: 'Ticket non trouvé' };
  }

  if (ticket.ownerId !== CURRENT_USER_ID) {
    return { success: false, error: 'Ce ticket ne vous appartient pas' };
  }

  if (ticket.status !== 'SOLD') {
    return { success: false, error: 'Ce ticket a déjà été révélé' };
  }

  // Simuler la révélation (en production: appel API backend)
  // Le résultat est déjà déterminé dans prizeAmount
  const revealedTicket: Ticket = {
    ...ticket,
    status: 'REVEALED',
    revealedAt: new Date().toISOString().split('T')[0],
  };

  // Mettre à jour le ticket dans les données mock
  const index = mockTickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    mockTickets[index] = revealedTicket;
  }

  return { success: true, ticket: revealedTicket };
}

/**
 * Créer une demande de retrait (simulation)
 * En production: appeler l'API backend
 */
export function createWithdrawal(params: {
  amount: number;
  method: 'MONCASH' | 'NATCASH' | 'BANK';
  beneficiaryName: string;
  destination: string;
}): { success: boolean; withdrawal?: WithdrawalRequest; error?: string } {
  const walletData = getUserWalletData();

  // Validation
  if (params.amount <= 0) {
    return { success: false, error: 'Le montant doit être supérieur à 0' };
  }

  if (params.amount > walletData.availableForWithdrawal) {
    return { success: false, error: 'Solde insuffisant' };
  }

  // Créer le retrait (en production: appel API backend)
  const withdrawal: WithdrawalRequest = {
    id: `w${Date.now()}`,
    userId: CURRENT_USER_ID,
    amount: params.amount,
    provider: params.method === 'BANK' ? 'MONCASH' : params.method, // Simplification
    phoneNumber: params.destination,
    status: 'REQUESTED',
    requestedAt: new Date().toISOString(),
    validatedAt: null,
    processingAt: null,
    paidAt: null,
    failedAt: null,
    providerTransactionId: null,
    providerConfirmationCode: null,
    providerCallbackReceived: false,
    lastStatusCheckAt: null,
    idempotencyKey: `idem-${Date.now()}`,
    retryCount: 0,
    maxRetries: 3,
    validatedBy: null,
    rejectionReason: null,
    adminNotes: `Bénéficiaire: ${params.beneficiaryName}`,
  };

  // Ajouter aux données mock
  mockWithdrawals.push(withdrawal);

  return { success: true, withdrawal };
}
