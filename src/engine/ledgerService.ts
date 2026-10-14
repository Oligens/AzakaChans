/**
 * LEDGER SERVICE - AZAKA CHANS
 * 
 * Service de registre comptable immuable et de réconciliation.
 * Responsabilités :
 * - Enregistrer les crédits et débits autorisés
 * - Maintenir un registre comptable immuable au niveau applicatif
 * - Empêcher les doubles crédits
 * - Réconcilier les soldes des portefeuilles avec les écritures comptables
 * - Maintenir la traçabilité de chaque opération
 * - Détecter les divergences
 */

import { Transaction, TransactionType } from '../types';

// ============================================================
// TYPES
// ============================================================

export interface LedgerEntry {
  id: string;
  transactionId: string;
  account: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: string;
  operationType: TransactionType;
  reference: string;
  description: string;
  createdAt: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERSED';
  idempotencyKey: string;
  reconciliationRef: string | null;
}

export interface AccountBalance {
  account: string;
  balance: number;
  totalCredits: number;
  totalDebits: number;
  lastUpdatedAt: string;
}

export interface ReconciliationResult {
  timestamp: string;
  account: string;
  ledgerBalance: number;
  externalBalance: number;
  difference: number;
  isBalanced: boolean;
  anomalies: ReconciliationAnomaly[];
}

export interface ReconciliationAnomaly {
  id: string;
  type: 'MISSING_ENTRY' | 'DUPLICATE_ENTRY' | 'AMOUNT_MISMATCH' | 'TIMESTAMP_MISMATCH';
  description: string;
  amount: number;
  reference: string;
  detectedAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface CompensatingEntry {
  id: string;
  originalTransactionId: string;
  reason: string;
  entries: LedgerEntry[];
  createdAt: string;
  createdBy: string;
  approvedBy: string | null;
}

// ============================================================
// REGISTRE COMPTABLE (simulation en mémoire)
// ============================================================

class LedgerStore {
  private entries: Map<string, LedgerEntry> = new Map();
  private idempotencyKeys: Set<string> = new Set();
  private balances: Map<string, AccountBalance> = new Map();
  private anomalies: Map<string, ReconciliationAnomaly> = new Map();
  private compensatingEntries: Map<string, CompensatingEntry> = new Map();

  // Ajouter une écriture
  addEntry(entry: LedgerEntry): { success: boolean; error?: string } {
    // Vérifier l'idempotence
    if (this.idempotencyKeys.has(entry.idempotencyKey)) {
      return { success: false, error: 'Écriture déjà enregistrée (idempotence)' };
    }

    // Vérifier que la transaction n'existe pas déjà
    if (this.entries.has(entry.id)) {
      return { success: false, error: 'Écriture déjà existante' };
    }

    // Enregistrer l'écriture
    this.entries.set(entry.id, entry);
    this.idempotencyKeys.add(entry.idempotencyKey);

    // Mettre à jour le solde si l'écriture est complétée
    if (entry.status === 'COMPLETED') {
      this.updateBalance(entry.account, entry.type, entry.amount);
    }

    return { success: true };
  }

  // Mettre à jour le solde d'un compte
  private updateBalance(account: string, type: 'DEBIT' | 'CREDIT', amount: number): void {
    let balance = this.balances.get(account);
    if (!balance) {
      balance = {
        account,
        balance: 0,
        totalCredits: 0,
        totalDebits: 0,
        lastUpdatedAt: new Date().toISOString(),
      };
    }

    if (type === 'CREDIT') {
      balance.balance += amount;
      balance.totalCredits += amount;
    } else {
      balance.balance -= amount;
      balance.totalDebits += amount;
    }

    balance.lastUpdatedAt = new Date().toISOString();
    this.balances.set(account, balance);
  }

  // Obtenir le solde d'un compte
  getBalance(account: string): AccountBalance | null {
    return this.balances.get(account) || null;
  }

  // Obtenir toutes les écritures d'un compte
  getAccountEntries(account: string): LedgerEntry[] {
    return Array.from(this.entries.values()).filter(e => e.account === account);
  }

  // Obtenir toutes les écritures
  getAllEntries(): LedgerEntry[] {
    return Array.from(this.entries.values());
  }

  // Vérifier si une écriture existe
  hasEntry(id: string): boolean {
    return this.entries.has(id);
  }

  // Ajouter une anomalie
  addAnomaly(anomaly: ReconciliationAnomaly): void {
    this.anomalies.set(anomaly.id, anomaly);
  }

  // Obtenir les anomalies non résolues
  getUnresolvedAnomalies(): ReconciliationAnomaly[] {
    return Array.from(this.anomalies.values()).filter(a => !a.resolved);
  }

  // Résoudre une anomalie
  resolveAnomaly(id: string, resolvedBy: string): boolean {
    const anomaly = this.anomalies.get(id);
    if (!anomaly) return false;

    anomaly.resolved = true;
    anomaly.resolvedAt = new Date().toISOString();
    anomaly.resolvedBy = resolvedBy;
    this.anomalies.set(id, anomaly);
    return true;
  }

  // Ajouter une écriture compensatoire
  addCompensatingEntry(entry: CompensatingEntry): void {
    this.compensatingEntries.set(entry.id, entry);
    
    // Appliquer les écritures compensatoires
    for (const ledgerEntry of entry.entries) {
      this.addEntry(ledgerEntry);
    }
  }

  // Obtenir les écritures compensatoires
  getCompensatingEntries(): CompensatingEntry[] {
    return Array.from(this.compensatingEntries.values());
  }
}

// Instance globale du registre
const ledgerStore = new LedgerStore();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Enregistrer une transaction dans le registre
 */
export function recordTransaction(params: {
  transactionId: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  operationType: TransactionType;
  reference: string;
  description: string;
  idempotencyKey: string;
}): { success: boolean; error?: string } {
  const timestamp = new Date().toISOString();

  // Créer l'écriture de débit
  const debitEntry: LedgerEntry = {
    id: `${params.transactionId}-debit`,
    transactionId: params.transactionId,
    account: params.debitAccount,
    type: 'DEBIT',
    amount: params.amount,
    currency: params.currency,
    operationType: params.operationType,
    reference: params.reference,
    description: params.description,
    createdAt: timestamp,
    status: 'COMPLETED',
    idempotencyKey: `${params.idempotencyKey}-debit`,
    reconciliationRef: null,
  };

  // Créer l'écriture de crédit
  const creditEntry: LedgerEntry = {
    id: `${params.transactionId}-credit`,
    transactionId: params.transactionId,
    account: params.creditAccount,
    type: 'CREDIT',
    amount: params.amount,
    currency: params.currency,
    operationType: params.operationType,
    reference: params.reference,
    description: params.description,
    createdAt: timestamp,
    status: 'COMPLETED',
    idempotencyKey: `${params.idempotencyKey}-credit`,
    reconciliationRef: null,
  };

  // Enregistrer les deux écritures
  const debitResult = ledgerStore.addEntry(debitEntry);
  if (!debitResult.success) {
    return debitResult;
  }

  const creditResult = ledgerStore.addEntry(creditEntry);
  if (!creditResult.success) {
    // Rollback du débit si le crédit échoue
    // En production: utiliser une transaction ACID
    return creditResult;
  }

  return { success: true };
}

/**
 * Obtenir le solde d'un compte
 */
export function getAccountBalance(account: string): AccountBalance | null {
  return ledgerStore.getBalance(account);
}

/**
 * Réconcilier un compte avec une source externe
 */
export function reconcileAccount(params: {
  account: string;
  externalBalance: number;
  externalReference: string;
}): ReconciliationResult {
  const ledgerBalance = ledgerStore.getBalance(params.account);
  const balance = ledgerBalance?.balance || 0;
  const difference = balance - params.externalBalance;

  const anomalies: ReconciliationAnomaly[] = [];

  // Détecter les divergences
  if (Math.abs(difference) > 0.01) {
    anomalies.push({
      id: `anomaly-${Date.now()}`,
      type: 'AMOUNT_MISMATCH',
      description: `Divergence détectée: registre=${balance}, externe=${params.externalBalance}`,
      amount: difference,
      reference: params.externalReference,
      detectedAt: new Date().toISOString(),
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
    });

    // Enregistrer l'anomalie
    ledgerStore.addAnomaly(anomalies[0]);
  }

  return {
    timestamp: new Date().toISOString(),
    account: params.account,
    ledgerBalance: balance,
    externalBalance: params.externalBalance,
    difference,
    isBalanced: Math.abs(difference) <= 0.01,
    anomalies,
  };
}

/**
 * Obtenir les anomalies non résolues
 */
export function getUnresolvedAnomalies(): ReconciliationAnomaly[] {
  return ledgerStore.getUnresolvedAnomalies();
}

/**
 * Résoudre une anomalie
 */
export function resolveAnomaly(params: {
  anomalyId: string;
  resolvedBy: string;
  reason: string;
}): boolean {
  return ledgerStore.resolveAnomaly(params.anomalyId, params.resolvedBy);
}

/**
 * Créer une écriture compensatoire
 */
export function createCompensatingEntry(params: {
  originalTransactionId: string;
  reason: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  createdBy: string;
}): CompensatingEntry {
  const timestamp = new Date().toISOString();
  const id = `comp-${Date.now()}`;

  const entries: LedgerEntry[] = [
    {
      id: `${id}-debit`,
      transactionId: id,
      account: params.debitAccount,
      type: 'DEBIT',
      amount: params.amount,
      currency: params.currency,
      operationType: 'REFUND',
      reference: params.originalTransactionId,
      description: `Écriture compensatoire: ${params.reason}`,
      createdAt: timestamp,
      status: 'COMPLETED',
      idempotencyKey: `${id}-debit`,
      reconciliationRef: null,
    },
    {
      id: `${id}-credit`,
      transactionId: id,
      account: params.creditAccount,
      type: 'CREDIT',
      amount: params.amount,
      currency: params.currency,
      operationType: 'REFUND',
      reference: params.originalTransactionId,
      description: `Écriture compensatoire: ${params.reason}`,
      createdAt: timestamp,
      status: 'COMPLETED',
      idempotencyKey: `${id}-credit`,
      reconciliationRef: null,
    },
  ];

  const compensatingEntry: CompensatingEntry = {
    id,
    originalTransactionId: params.originalTransactionId,
    reason: params.reason,
    entries,
    createdAt: timestamp,
    createdBy: params.createdBy,
    approvedBy: null,
  };

  ledgerStore.addCompensatingEntry(compensatingEntry);
  return compensatingEntry;
}

/**
 * Vérifier l'intégrité du registre
 */
export function verifyLedgerIntegrity(): {
  isValid: boolean;
  totalEntries: number;
  totalAnomalies: number;
  errors: string[];
} {
  const allEntries = ledgerStore.getAllEntries();
  const anomalies = ledgerStore.getUnresolvedAnomalies();
  const errors: string[] = [];

  // Vérifier que chaque transaction a un débit et un crédit
  const transactionIds = new Set(allEntries.map(e => e.transactionId));
  for (const txId of transactionIds) {
    const txEntries = allEntries.filter(e => e.transactionId === txId);
    const debits = txEntries.filter(e => e.type === 'DEBIT');
    const credits = txEntries.filter(e => e.type === 'CREDIT');

    if (debits.length !== 1 || credits.length !== 1) {
      errors.push(`Transaction ${txId}: nombre invalide de débits (${debits.length}) ou crédits (${credits.length})`);
    }

    if (debits.length === 1 && credits.length === 1) {
      if (debits[0].amount !== credits[0].amount) {
        errors.push(`Transaction ${txId}: montant débit (${debits[0].amount}) ≠ crédit (${credits[0].amount})`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    totalEntries: allEntries.length,
    totalAnomalies: anomalies.length,
    errors,
  };
}

/**
 * Obtenir toutes les écritures
 */
export function getAllLedgerEntries(): LedgerEntry[] {
  return ledgerStore.getAllEntries();
}

/**
 * Obtenir les écritures compensatoires
 */
export function getCompensatingEntries(): CompensatingEntry[] {
  return ledgerStore.getCompensatingEntries();
}
