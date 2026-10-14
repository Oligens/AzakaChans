/**
 * PAYMENT SERVICE - ChansAyiti
 * 
 * Service de gestion des paiements et intégrations prestataires.
 * Responsabilités :
 * - Confirmer les achats
 * - Gérer les demandes de retrait
 * - Intégrer les prestataires de paiement autorisés (MonCash/NatCash)
 * - Gérer les échecs, les délais d'attente et les rapprochements
 * - Empêcher les doubles paiements
 */

import { WithdrawalProvider } from '../types';

// ============================================================
// TYPES
// ============================================================

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'TIMEOUT' 
  | 'REVERSED';

export interface PaymentRequest {
  id: string;
  type: 'PURCHASE' | 'WITHDRAWAL';
  userId: string;
  amount: number;
  currency: string;
  provider: WithdrawalProvider | null;
  phoneNumber: string | null;
  idempotencyKey: string;
  createdAt: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  providerTransactionId: string | null;
  providerConfirmationCode: string | null;
  errorMessage: string | null;
  completedAt: string | null;
}

export interface ProviderIntegration {
  name: string;
  provider: WithdrawalProvider;
  enabled: boolean;
  baseUrl: string;
  apiKey: string; // En production: variable d'environnement
  timeout: number; // millisecondes
  maxRetries: number;
}

export interface PaymentReconciliation {
  id: string;
  paymentId: string;
  providerTransactionId: string;
  expectedAmount: number;
  actualAmount: number;
  status: 'MATCHED' | 'MISMATCH' | 'MISSING' | 'DUPLICATE';
  reconciledAt: string;
  reconciledBy: string;
  notes: string;
}

export interface ProviderCallback {
  provider: WithdrawalProvider;
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  confirmationCode: string;
  timestamp: string;
  signature: string; // Pour vérifier l'authenticité
}

// ============================================================
// CONFIGURATION DES PRESTATAIRES
// ============================================================

const providerConfigs: Record<WithdrawalProvider, ProviderIntegration> = {
  MONCASH: {
    name: 'MonCash (Digicel)',
    provider: 'MONCASH',
    enabled: true,
    baseUrl: 'https://api.moncash.com/v1',
    apiKey: 'MC_TEST_KEY', // En production: variable d'environnement
    timeout: 30000,
    maxRetries: 3,
  },
  NATCASH: {
    name: 'NatCash (NATCOM)',
    provider: 'NATCASH',
    enabled: true,
    baseUrl: 'https://api.natcash.ht/v1',
    apiKey: 'NC_TEST_KEY', // En production: variable d'environnement
    timeout: 30000,
    maxRetries: 3,
  },
};

// ============================================================
// SIMULATION DE PRESTATAIRE (pour tests)
// ============================================================

class ProviderSimulator {
  private transactions: Map<string, PaymentResponse> = new Map();
  private callbacks: Map<string, ProviderCallback> = new Map();

  // Simuler un paiement
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const providerConfig = request.provider ? providerConfigs[request.provider] : null;
    
    if (!providerConfig || !providerConfig.enabled) {
      return {
        paymentId: request.id,
        status: 'FAILED',
        providerTransactionId: null,
        providerConfirmationCode: null,
        errorMessage: 'Prestataire non disponible',
        completedAt: null,
      };
    }

    // Simuler un délai de traitement
    await this.simulateDelay(1000);

    // Simuler une réponse du prestataire
    const providerTxId = `${request.provider}-TX-${Date.now()}`;
    const confirmationCode = `${request.provider}-CONF-${Math.random().toString(36).substring(7)}`;

    const response: PaymentResponse = {
      paymentId: request.id,
      status: 'PROCESSING',
      providerTransactionId: providerTxId,
      providerConfirmationCode: confirmationCode,
      errorMessage: null,
      completedAt: null,
    };

    this.transactions.set(request.id, response);

    // Simuler un callback asynchrone (après 2 secondes)
    setTimeout(() => {
      const callback: ProviderCallback = {
        provider: request.provider!,
        transactionId: providerTxId,
        status: 'SUCCESS',
        amount: request.amount,
        confirmationCode,
        timestamp: new Date().toISOString(),
        signature: `sig-${Math.random().toString(36).substring(7)}`,
      };
      this.callbacks.set(providerTxId, callback);
      
      // Mettre à jour le statut
      const tx = this.transactions.get(request.id);
      if (tx) {
        tx.status = 'COMPLETED';
        tx.completedAt = new Date().toISOString();
      }
    }, 2000);

    return response;
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse | null> {
    return this.transactions.get(paymentId) || null;
  }

  // Vérifier le statut via le prestataire (simulation)
  async verifyWithProvider(provider: WithdrawalProvider, providerTxId: string): Promise<PaymentResponse | null> {
    const callback = this.callbacks.get(providerTxId);
    if (!callback) {
      return null; // Transaction non trouvée chez le prestataire
    }

    // Trouver le paiement correspondant
    for (const [paymentId, tx] of this.transactions.entries()) {
      if (tx.providerTransactionId === providerTxId) {
        return {
          ...tx,
          status: callback.status === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
          completedAt: callback.status === 'SUCCESS' ? callback.timestamp : null,
        };
      }
    }

    return null;
  }

  // Simuler un délai
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simuler un timeout
  async simulateTimeout(request: PaymentRequest): Promise<PaymentResponse> {
    return {
      paymentId: request.id,
      status: 'TIMEOUT',
      providerTransactionId: null,
      providerConfirmationCode: null,
      errorMessage: 'Timeout du prestataire',
      completedAt: null,
    };
  }

  // Simuler un échec
  async simulateFailure(request: PaymentRequest, reason: string): Promise<PaymentResponse> {
    return {
      paymentId: request.id,
      status: 'FAILED',
      providerTransactionId: null,
      providerConfirmationCode: null,
      errorMessage: reason,
      completedAt: null,
    };
  }
}

const providerSimulator = new ProviderSimulator();

// ============================================================
// GESTIONNAIRE DE PAIEMENTS
// ============================================================

class PaymentManager {
  private payments: Map<string, PaymentRequest> = new Map();
  private idempotencyKeys: Set<string> = new Set();
  private reconciliations: Map<string, PaymentReconciliation> = new Map();

  // Créer une demande de paiement
  createPayment(params: {
    type: 'PURCHASE' | 'WITHDRAWAL';
    userId: string;
    amount: number;
    currency: string;
    provider: WithdrawalProvider | null;
    phoneNumber: string | null;
    idempotencyKey: string;
  }): { success: boolean; payment?: PaymentRequest; error?: string } {
    // Vérifier l'idempotence
    if (this.idempotencyKeys.has(params.idempotencyKey)) {
      return { success: false, error: 'Paiement déjà créé (idempotence)' };
    }

    const payment: PaymentRequest = {
      id: `pay-${Date.now()}`,
      type: params.type,
      userId: params.userId,
      amount: params.amount,
      currency: params.currency,
      provider: params.provider,
      phoneNumber: params.phoneNumber,
      idempotencyKey: params.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    this.payments.set(payment.id, payment);
    this.idempotencyKeys.add(params.idempotencyKey);

    return { success: true, payment };
  }

  // Initier un paiement auprès du prestataire
  async initiatePayment(paymentId: string): Promise<PaymentResponse> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      return {
        paymentId,
        status: 'FAILED',
        providerTransactionId: null,
        providerConfirmationCode: null,
        errorMessage: 'Paiement non trouvé',
        completedAt: null,
      };
    }

    return await providerSimulator.initiatePayment(payment);
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse | null> {
    return await providerSimulator.checkPaymentStatus(paymentId);
  }

  // Vérifier avec le prestataire en cas de timeout
  async verifyWithProvider(paymentId: string): Promise<PaymentResponse | null> {
    const payment = this.payments.get(paymentId);
    if (!payment || !payment.provider) {
      return null;
    }

    // D'abord vérifier localement
    const localStatus = await providerSimulator.checkPaymentStatus(paymentId);
    if (localStatus && localStatus.status === 'COMPLETED') {
      return localStatus;
    }

    // Si timeout ou incertain, vérifier auprès du prestataire
    // En production: appeler l'API du prestataire pour vérifier l'état réel
    // Pour cette simulation, on retourne le statut local
    return localStatus;
  }

  // Traiter un callback du prestataire
  processCallback(callback: ProviderCallback): { success: boolean; error?: string } {
    // Vérifier la signature (en production: vérifier avec la clé secrète)
    if (!callback.signature) {
      return { success: false, error: 'Signature invalide' };
    }

    // Enregistrer le callback
    // En production: mettre à jour le statut du paiement dans la base de données
    return { success: true };
  }

  // Rapprocher un paiement
  reconcile(params: {
    paymentId: string;
    providerTransactionId: string;
    expectedAmount: number;
    actualAmount: number;
    reconciledBy: string;
    notes: string;
  }): PaymentReconciliation {
    const status = params.expectedAmount === params.actualAmount ? 'MATCHED' : 'MISMATCH';

    const reconciliation: PaymentReconciliation = {
      id: `recon-${Date.now()}`,
      paymentId: params.paymentId,
      providerTransactionId: params.providerTransactionId,
      expectedAmount: params.expectedAmount,
      actualAmount: params.actualAmount,
      status,
      reconciledAt: new Date().toISOString(),
      reconciledBy: params.reconciledBy,
      notes: params.notes,
    };

    this.reconciliations.set(reconciliation.id, reconciliation);
    return reconciliation;
  }

  // Obtenir les rapprochements
  getReconciliations(): PaymentReconciliation[] {
    return Array.from(this.reconciliations.values());
  }

  // Obtenir tous les paiements
  getAllPayments(): PaymentRequest[] {
    return Array.from(this.payments.values());
  }
}

const paymentManager = new PaymentManager();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Créer une demande de paiement
 */
export function createPayment(params: {
  type: 'PURCHASE' | 'WITHDRAWAL';
  userId: string;
  amount: number;
  currency: string;
  provider: WithdrawalProvider | null;
  phoneNumber: string | null;
  idempotencyKey: string;
}): { success: boolean; payment?: PaymentRequest; error?: string } {
  return paymentManager.createPayment(params);
}

/**
 * Initier un paiement auprès du prestataire
 */
export async function initiatePayment(paymentId: string): Promise<PaymentResponse> {
  return await paymentManager.initiatePayment(paymentId);
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentResponse | null> {
  return await paymentManager.checkPaymentStatus(paymentId);
}

/**
 * Vérifier avec le prestataire (en cas de timeout)
 */
export async function verifyWithProvider(paymentId: string): Promise<PaymentResponse | null> {
  return await paymentManager.verifyWithProvider(paymentId);
}

/**
 * Traiter un callback du prestataire
 */
export function processCallback(callback: ProviderCallback): { success: boolean; error?: string } {
  return paymentManager.processCallback(callback);
}

/**
 * Rapprocher un paiement
 */
export function reconcilePayment(params: {
  paymentId: string;
  providerTransactionId: string;
  expectedAmount: number;
  actualAmount: number;
  reconciledBy: string;
  notes: string;
}): PaymentReconciliation {
  return paymentManager.reconcile(params);
}

/**
 * Obtenir les rapprochements
 */
export function getReconciliations(): PaymentReconciliation[] {
  return paymentManager.getReconciliations();
}

/**
 * Obtenir tous les paiements
 */
export function getAllPayments(): PaymentRequest[] {
  return paymentManager.getAllPayments();
}

/**
 * Obtenir la configuration des prestataires
 */
export function getProviderConfigs(): Record<WithdrawalProvider, ProviderIntegration> {
  return providerConfigs;
}

/**
 * Vérifier si un prestataire est disponible
 */
export function isProviderAvailable(provider: WithdrawalProvider): boolean {
  const config = providerConfigs[provider];
  return config?.enabled || false;
}
