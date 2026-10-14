import { TicketStatus, TicketType, SeriesStatus, FinancialAlertLevel } from '../types';

// ============================================================
// MODÈLE DE SÉRIE (BATCH) AVEC BUDGET ET RÈGLES
// ============================================================

export interface PrizeTier {
  amount: number;          // Montant du lot en HTG
  quantity: number;        // Nombre de tickets avec ce lot
  probability: number;     // Probabilité calculée (quantity / totalWinners)
}

export interface SeriesRules {
  version: string;                    // Version des règles (sémantique)
  algorithmVersion: string;           // Version de l'algorithme de génération
  winRate: number;                    // Taux de gagnants (0.3, 0.4, 0.5, 0.6)
  maxPrize: number;                   // Plafond maximum (100 000 HTG)
  minPrize: number;                   // Plancher minimum (50 HTG)
  prizeTiers: PrizeTier[];            // Grille de lots
  createdAt: string;
  approvedBy: string;                 // ID de l'approbateur
}

export interface FinancialBudget {
  totalRevenue: number;               // Recettes attendues (totalTickets * ticketPrice)
  maxPrizeCost: number;               // Coût maximal de tous les lots
  approvedBudget: number;             // Budget approuvé par la direction
  reserveAllocation: number;          // Réserve affectée aux gains
  operationalCosts: number;           // Charges opérationnelles estimées
  taxProvision: number;               // Taxes à provisionner
  distributorCommissions: number;     // Commissions distributeurs
  paymentFees: number;                // Frais de paiement (MonCash/NatCash)
  netExpected: number;                // Résultat net attendu
  coverageRatio: number;              // Ratio de couverture (>= 1.0 requis)
}

export interface Series {
  id: string;
  name: string;
  ticketPrice: number;                // 100, 250, 500, 1000 HTG
  totalTickets: number;               // Nombre total de tickets dans la série
  status: SeriesStatus;
  rules: SeriesRules;
  budget: FinancialBudget;
  
  // Compteurs en temps réel
  ticketsSold: number;
  ticketsRevealed: number;
  winnersCount: number;
  totalPrizesPaid: number;
  totalPrizesPending: number;         // Gains validés mais non encore payés
  
  // Dates
  publishedAt: string | null;
  salesStartAt: string;
  salesEndAt: string | null;
  closedAt: string | null;
  
  // Traçabilité
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  
  // Sécurité
  resultSeedHash: string;             // Hash de la graine aléatoire (preuve d'immutabilité)
  isLocked: boolean;                  // Vrai une fois la série publiée
  
  // Tickets invendus
  unsoldTicketsPolicy: 'DESTROY' | 'TRANSFER' | 'HOLD';
}

// ============================================================
// MODÈLE FINANCIER GLOBAL
// ============================================================

export interface FinancialSnapshot {
  timestamp: string;
  
  // Recettes
  grossRevenue: number;               // Chiffre d'affaires brut
  confirmedCollections: number;       // Encaissements confirmés
  refunds: number;                    // Remboursements
  variableFees: number;               // Frais variables (paiements)
  distributorCommissions: number;     // Commissions distributeurs
  netRevenue: number;                 // recettes_net = encaissements - remboursements - frais - commissions
  
  // Engagements
  validatedUnpaidGains: number;       // Gains validés mais non payés
  pendingWithdrawals: number;         // Retraits en cours de traitement
  reservedForPrizes: number;          // Fonds réservés pour les lots
  operationalCosts: number;           // Charges opérationnelles
  taxProvision: number;               // Taxes à provisionner
  
  // Résultat
  estimatedResult: number;            // resultat_estime = net - coûts - taxes - lots
  availableLiquidity: number;         // Liquidités disponibles pour payer les gains
  
  // Couverture
  totalEngagements: number;           // engagements_restants
  coverageRatio: number;              // couverture_gains = fonds_affectes / engagements
  isSolvent: boolean;
  
  // Alertes
  alerts: FinancialAlert[];
}

export interface FinancialAlert {
  id: string;
  level: FinancialAlertLevel;
  seriesId: string | null;
  message: string;
  details: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
}

// ============================================================
// MODÈLE DE GÉNÉRATION DE TICKETS
// ============================================================

export interface TicketGenerationRequest {
  seriesId: string;
  totalTickets: number;
  prizeDistribution: PrizeTier[];
  seed: string;                       // Graine cryptographique
  algorithmVersion: string;
}

export interface TicketGenerationResult {
  seriesId: string;
  tickets: GeneratedTicket[];
  seedHash: string;                   // Preuve cryptographique
  generationTimestamp: string;
  validationPassed: boolean;
  validationErrors: string[];
}

export interface GeneratedTicket {
  index: number;
  publicId: string;
  secretHash: string;
  isWinner: boolean;
  prizeAmount: number | null;
  prizeTier: number | null;           // Index dans la grille
}

// ============================================================
// MODÈLE DE RENOUVELLEMENT HORAIRE
// ============================================================

export interface HourlyCycleExecution {
  id: string;
  cycleNumber: number;
  startedAt: string;
  completedAt: string | null;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  
  // Résultats des vérifications
  financialCheckPassed: boolean;
  previousSeriesReviewed: boolean;
  newSeriesPublished: boolean;
  
  // Détails
  seriesPublishedId: string | null;
  alertsGenerated: number;
  errorsEncountered: string[];
  
  // Idempotence
  idempotencyKey: string;
  lockAcquiredAt: string | null;
}

// ============================================================
// MODÈLE DE SURVEILLANCE
// ============================================================

export interface SurveillanceDashboard {
  timestamp: string;
  
  // Par catégorie de ticket
  byCategory: {
    price: number;
    seriesCount: number;
    ticketsSold: number;
    ticketsRevealed: number;
    winnersCount: number;
    losersCount: number;
    unsoldCount: number;
    totalPrizes: number;
    revenue: number;
    margin: number;
  }[];
  
  // Par série
  seriesSummary: {
    id: string;
    name: string;
    price: number;
    status: SeriesStatus;
    soldPercent: number;
    revealedPercent: number;
    prizeCost: number;
    revenue: number;
    coverageRatio: number;
    isBlocked: boolean;
  }[];
  
  // Gains
  gainsOverview: {
    validated: number;
    paid: number;
    pending: number;
    total: number;
  };
  
  // Réserves
  reservesOverview: {
    allocated: number;
    available: number;
    engaged: number;
    ratio: number;
  };
  
  // Anomalies
  anomalies: {
    fraudAttempts: number;
    reconciliationErrors: number;
    failedWithdrawals: number;
    suspendedSeries: number;
  };
  
  // Prévisions
  forecasts: {
    expectedRevenueNext24h: number;
    expectedPrizesNext24h: number;
    expectedMarginNext24h: number;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    assumptions: string[];
  };
}

// ============================================================
// MODÈLE DE PAIEMENT (RETRAIT)
// ============================================================

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  provider: 'MONCASH' | 'NATCASH';
  phoneNumber: string;
  status: 'REQUESTED' | 'VALIDATED' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED' | 'RECONCILED';
  
  // Cycle de vie
  requestedAt: string;
  validatedAt: string | null;
  processingAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  
  // Intégration prestataire
  providerTransactionId: string | null;
  providerConfirmationCode: string | null;
  providerCallbackReceived: boolean;
  lastStatusCheckAt: string | null;
  
  // Sécurité
  idempotencyKey: string;
  retryCount: number;
  maxRetries: number;
  
  // Audit
  validatedBy: string | null;
  rejectionReason: string | null;
  adminNotes: string;
}

// ============================================================
// CONFIGURATION GLOBALE
// ============================================================

export interface SystemConfig {
  // Catégories de tickets
  ticketCategories: {
    price: number;
    targetWinRate: number;
    enabled: boolean;
  }[];
  
  // Grille de lots
  prizeGrid: number[];
  
  // Limites
  maxPrizeAmount: number;             // 100 000 HTG
  minPrizeAmount: number;             // 50 HTG
  maxDailyWithdrawal: number;         // Limite par utilisateur/jour
  maxWithdrawalWithoutKYC: number;    // Seuil KYC
  
  // Seuils de sécurité
  minCoverageRatio: number;           // Ratio minimum (ex: 1.2)
  alertCoverageRatio: number;         // Seuil d'alerte (ex: 1.5)
  
  // Renouvellement
  hourlyCycleEnabled: boolean;
  maxSeriesPerDay: number;
  
  // Prestataires
  moncashEnabled: boolean;
  natcashEnabled: boolean;
}
