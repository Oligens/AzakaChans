/**
 * MOTEUR FINANCIER - AZAKA CHANS
 * 
 * Service centralisé qui calcule et vérifie la solvabilité du système.
 * Aucune nouvelle série ne peut être publiée sans budget vérifié.
 * Aucun gain validé ne peut être annulé.
 */

import { Series, FinancialSnapshot, FinancialAlert, PrizeTier, SystemConfig } from './types';

// ============================================================
// CALCUL DES RECETTES NETTES
// ============================================================

export interface RevenueCalculation {
  grossRevenue: number;
  confirmedCollections: number;
  refunds: number;
  variableFees: number;
  distributorCommissions: number;
  netRevenue: number;
}

export function calculateNetRevenue(params: {
  totalTicketsSold: number;
  averageTicketPrice: number;
  refundRate: number;
  paymentFeeRate: number;
  distributorCommissionRate: number;
}): RevenueCalculation {
  const grossRevenue = params.totalTicketsSold * params.averageTicketPrice;
  const refunds = grossRevenue * params.refundRate;
  const confirmedCollections = grossRevenue - refunds;
  const variableFees = confirmedCollections * params.paymentFeeRate;
  const distributorCommissions = confirmedCollections * params.distributorCommissionRate;
  
  // recettes_net = encaissements_confirmés - remboursements - frais_variables - commissions
  const netRevenue = confirmedCollections - variableFees - distributorCommissions;
  
  return {
    grossRevenue,
    confirmedCollections,
    refunds,
    variableFees,
    distributorCommissions,
    netRevenue,
  };
}

// ============================================================
// CALCUL DU RÉSULTAT ESTIMÉ
// ============================================================

export interface ResultEstimation {
  netRevenue: number;
  operationalCosts: number;
  taxProvision: number;
  totalPrizeCost: number;
  estimatedResult: number;
  marginPercent: number;
}

export function estimateResult(params: {
  netRevenue: number;
  operationalCosts: number;
  taxRate: number;
  totalPrizesPaid: number;
  totalPrizesPending: number;
}): ResultEstimation {
  const taxProvision = params.netRevenue * params.taxRate;
  const totalPrizeCost = params.totalPrizesPaid + params.totalPrizesPending;
  
  // resultat_estime = recettes_net - couts_operationnels - taxes_a_provisionner - cout_des_lots
  const estimatedResult = params.netRevenue - params.operationalCosts - taxProvision - totalPrizeCost;
  const marginPercent = params.netRevenue > 0 ? (estimatedResult / params.netRevenue) * 100 : 0;
  
  return {
    netRevenue: params.netRevenue,
    operationalCosts: params.operationalCosts,
    taxProvision,
    totalPrizeCost,
    estimatedResult,
    marginPercent,
  };
}

// ============================================================
// CALCUL DE COUVERTURE
// ============================================================

export interface CoverageAnalysis {
  fundsAllocatedForPrizes: number;
  totalEngagements: number;
  coverageRatio: number;
  isSolvent: boolean;
  minRequiredRatio: number;
  alertThreshold: number;
}

export function analyzeCoverage(params: {
  fundsAllocatedForPrizes: number;
  validatedUnpaidGains: number;
  pendingWithdrawals: number;
  estimatedFuturePrizes: number;
  minCoverageRatio: number;
  alertCoverageRatio: number;
}): CoverageAnalysis {
  // engagements_restants = gains_valides_non_payes + autres_obligations_exigibles
  const totalEngagements = params.validatedUnpaidGains + params.pendingWithdrawals + params.estimatedFuturePrizes;
  
  // couverture_gains = fonds_affectes_aux_gains / engagements_restants
  // Traiter explicitement le cas où le dénominateur est nul
  const coverageRatio = totalEngagements === 0 
    ? Infinity // Pas d'engagements = couverture infinie
    : params.fundsAllocatedForPrizes / totalEngagements;
  
  return {
    fundsAllocatedForPrizes: params.fundsAllocatedForPrizes,
    totalEngagements,
    coverageRatio: coverageRatio === Infinity ? 999 : coverageRatio, // Cap pour affichage
    isSolvent: totalEngagements === 0 || coverageRatio >= params.minCoverageRatio,
    minRequiredRatio: params.minCoverageRatio,
    alertThreshold: params.alertCoverageRatio,
  };
}

// ============================================================
// VALIDATION DU BUDGET D'UNE SÉRIE
// ============================================================

export interface SeriesBudgetValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  maxPrizeCost: number;
  requiredBudget: number;
  approvedBudget: number;
  coverageRatio: number;
}

export function validateSeriesBudget(params: {
  prizeTiers: PrizeTier[];
  totalTickets: number;
  ticketPrice: number;
  approvedBudget: number;
  operationalCosts: number;
  taxRate: number;
  distributorCommissionRate: number;
  minCoverageRatio: number;
}): SeriesBudgetValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Calculer le coût maximal de tous les lots
  const maxPrizeCost = params.prizeTiers.reduce((sum, tier) => sum + (tier.amount * tier.quantity), 0);
  
  // Recettes attendues
  const expectedRevenue = params.totalTickets * params.ticketPrice;
  const refunds = expectedRevenue * 0.02; // 2% de remboursements estimés
  const fees = (expectedRevenue - refunds) * (params.distributorCommissionRate + 0.03); // 3% frais paiement
  const taxes = (expectedRevenue - refunds - fees) * params.taxRate;
  
  // Budget requis = lots + opérations + taxes
  const requiredBudget = maxPrizeCost + params.operationalCosts + taxes;
  
  // Vérification 1: Le budget approuvé couvre le coût maximal des lots
  if (params.approvedBudget < maxPrizeCost) {
    errors.push(`Budget approuvé (${params.approvedBudget.toLocaleString()} HTG) inférieur au coût maximal des lots (${maxPrizeCost.toLocaleString()} HTG)`);
  }
  
  // Vérification 2: Le budget couvre toutes les obligations
  if (params.approvedBudget < requiredBudget) {
    errors.push(`Budget insuffisant pour couvrir toutes les obligations. Requis: ${requiredBudget.toLocaleString()} HTG, Approuvé: ${params.approvedBudget.toLocaleString()} HTG`);
  }
  
  // Vérification 3: Le nombre de gagnants correspond aux quotas
  const totalWinners = params.prizeTiers.reduce((sum, tier) => sum + tier.quantity, 0);
  const expectedWinRate = totalWinners / params.totalTickets;
  
  if (totalWinners > params.totalTickets) {
    errors.push(`Nombre de gagnants (${totalWinners}) supérieur au nombre total de tickets (${params.totalTickets})`);
  }
  
  // Vérification 4: Pas de lot supérieur au plafond
  const maxPrize = Math.max(...params.prizeTiers.map(t => t.amount));
  if (maxPrize > 100000) {
    errors.push(`Lot maximum (${maxPrize.toLocaleString()} HTG) dépasse le plafond autorisé (100 000 HTG)`);
  }
  
  // Vérification 5: Pas de lot inférieur au plancher
  const minPrize = Math.min(...params.prizeTiers.map(t => t.amount));
  if (minPrize < 50) {
    errors.push(`Lot minimum (${minPrize.toLocaleString()} HTG) inférieur au plancher autorisé (50 HTG)`);
  }
  
  // Ratio de couverture
  const coverageRatio = params.approvedBudget > 0 ? params.approvedBudget / maxPrizeCost : 0;
  
  if (coverageRatio < params.minCoverageRatio && params.approvedBudget > 0) {
    warnings.push(`Ratio de couverture (${(coverageRatio * 100).toFixed(1)}%) inférieur au minimum requis (${(params.minCoverageRatio * 100).toFixed(0)}%)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    maxPrizeCost,
    requiredBudget,
    approvedBudget: params.approvedBudget,
    coverageRatio,
  };
}

// ============================================================
// VÉRIFICATION DES QUOTAS DE GAGNANTS
// ============================================================

export interface QuotaValidation {
  isValid: boolean;
  totalWinners: number;
  totalTickets: number;
  actualWinRate: number;
  targetWinRate: number;
  roundingAdjustment: number;
  errors: string[];
}

export function validateWinnerQuotas(params: {
  prizeTiers: PrizeTier[];
  totalTickets: number;
  targetWinRate: number;
}): QuotaValidation {
  const errors: string[] = [];
  const totalWinners = params.prizeTiers.reduce((sum, tier) => sum + tier.quantity, 0);
  const actualWinRate = totalWinners / params.totalTickets;
  
  // Règles d'arrondi pour les séries de petite taille
  const expectedWinners = Math.round(params.totalTickets * params.targetWinRate);
  const roundingAdjustment = totalWinners - expectedWinners;
  
  // Tolérance d'arrondi: ±2 tickets pour les petites séries
  const tolerance = params.totalTickets <= 100 ? 2 : Math.ceil(params.totalTickets * 0.02);
  
  if (Math.abs(roundingAdjustment) > tolerance) {
    errors.push(`Écart d'arrondi trop important: ${roundingAdjustment} tickets (tolérance: ±${tolerance})`);
  }
  
  if (totalWinners > params.totalTickets) {
    errors.push(`Impossible d'avoir plus de gagnants (${totalWinners}) que de tickets (${params.totalTickets})`);
  }
  
  return {
    isValid: errors.length === 0,
    totalWinners,
    totalTickets: params.totalTickets,
    actualWinRate,
    targetWinRate: params.targetWinRate,
    roundingAdjustment,
    errors,
  };
}

// ============================================================
// GÉNÉRATION D'ALERTE FINANCIÈRE
// ============================================================

export function generateFinancialAlerts(params: {
  coverageRatio: number;
  minCoverageRatio: number;
  alertCoverageRatio: number;
  seriesList: Series[];
  config: SystemConfig;
}): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  
  // Alerte de couverture globale
  if (params.coverageRatio < params.minCoverageRatio) {
    alerts.push({
      id: `alert-coverage-critical-${Date.now()}`,
      level: 'CRITICAL',
      seriesId: null,
      message: 'Ratio de couverture critique',
      details: `Le ratio de couverture (${(params.coverageRatio * 100).toFixed(1)}%) est inférieur au seuil minimum (${(params.minCoverageRatio * 100).toFixed(0)}%). Les nouvelles séries sont suspendues.`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
      acknowledgedBy: null,
    });
  } else if (params.coverageRatio < params.alertCoverageRatio) {
    alerts.push({
      id: `alert-coverage-warning-${Date.now()}`,
      level: 'WARNING',
      seriesId: null,
      message: 'Ratio de couverture en dessous du seuil d\'alerte',
      details: `Ratio actuel: ${(params.coverageRatio * 100).toFixed(1)}%. Seuil d'alerte: ${(params.alertCoverageRatio * 100).toFixed(0)}%. Surveiller les engagements.`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
      acknowledgedBy: null,
    });
  }
  
  // Alertes par série
  for (const series of params.seriesList) {
    if (series.status === 'DRAFT' && series.budget.approvedBudget === 0) {
      alerts.push({
        id: `alert-budget-${series.id}-${Date.now()}`,
        level: 'INFO',
        seriesId: series.id,
        message: `Série "${series.name}" en attente de financement`,
        details: `Budget requis: ${series.budget.maxPrizeCost.toLocaleString()} HTG. Budget approuvé: 0 HTG.`,
        createdAt: new Date().toISOString(),
        acknowledged: false,
        acknowledgedBy: null,
      });
    }
    
    if (series.status === 'PUBLISHED') {
      const seriesCoverage = series.budget.reserveAllocation / (series.totalPrizesPending + series.totalPrizesPaid);
      if (seriesCoverage < params.minCoverageRatio && series.totalPrizesPending > 0) {
        alerts.push({
          id: `alert-series-${series.id}-${Date.now()}`,
          level: 'WARNING',
          seriesId: series.id,
          message: `Couverture insuffisante pour la série "${series.name}"`,
          details: `Ratio: ${(seriesCoverage * 100).toFixed(1)}%. Envisager la suspension des ventes.`,
          createdAt: new Date().toISOString(),
          acknowledged: false,
          acknowledgedBy: null,
        });
      }
    }
  }
  
  return alerts;
}

// ============================================================
// VÉRIFICATION AVANT PUBLICATION D'UNE SÉRIE
// ============================================================

export interface PublicationCheck {
  canPublish: boolean;
  reasons: string[];
  financialHealth: {
    currentCoverage: number;
    projectedCoverage: number;
    availableLiquidity: number;
    requiredReserve: number;
  };
}

export function checkPublicationEligibility(params: {
  series: Series;
  currentCoverageRatio: number;
  availableLiquidity: number;
  minCoverageRatio: number;
  existingPendingObligations: number;
}): PublicationCheck {
  const reasons: string[] = [];
  
  // Vérifier que la série a un budget approuvé
  if (params.series.budget.approvedBudget < params.series.budget.maxPrizeCost) {
    reasons.push('Budget approuvé insuffisant pour couvrir le coût maximal des lots');
  }
  
  // Vérifier que la publication ne compromet pas la couverture globale
  const additionalObligation = params.series.budget.maxPrizeCost;
  const totalObligations = params.existingPendingObligations + additionalObligation;
  const projectedCoverage = params.availableLiquidity / totalObligations;
  
  if (projectedCoverage < params.minCoverageRatio) {
    reasons.push(`La publication réduirait la couverture à ${(projectedCoverage * 100).toFixed(1)}% (minimum: ${(params.minCoverageRatio * 100).toFixed(0)}%)`);
  }
  
  // Vérifier que la liquidité est suffisante
  if (params.availableLiquidity < params.series.budget.reserveAllocation) {
    reasons.push(`Liquidité disponible (${params.availableLiquidity.toLocaleString()} HTG) inférieure à la réserve requise (${params.series.budget.reserveAllocation.toLocaleString()} HTG)`);
  }
  
  return {
    canPublish: reasons.length === 0,
    reasons,
    financialHealth: {
      currentCoverage: params.currentCoverageRatio,
      projectedCoverage,
      availableLiquidity: params.availableLiquidity,
      requiredReserve: params.series.budget.reserveAllocation,
    },
  };
}

// ============================================================
// PROTECTION CONTRE LA DOUBLE RÉVÉLATION
// ============================================================

export interface RevealValidation {
  isValid: boolean;
  error: string | null;
  ticketStatus: string;
  prizeAmount: number | null;
}

export function validateTicketReveal(params: {
  ticketStatus: string;
  ticketOwnerId: string | null;
  requestingUserId: string;
  secretValid: boolean;
}): RevealValidation {
  // Vérifier le statut du ticket
  if (params.ticketStatus !== 'SOLD') {
    if (params.ticketStatus === 'REVEALED') {
      return { isValid: false, error: 'Ce ticket a déjà été révélé. Aucune double révélation autorisée.', ticketStatus: params.ticketStatus, prizeAmount: null };
    }
    if (params.ticketStatus === 'REDEEMED') {
      return { isValid: false, error: 'Ce ticket a déjà été encaissé.', ticketStatus: params.ticketStatus, prizeAmount: null };
    }
    if (params.ticketStatus === 'CREATED') {
      return { isValid: false, error: 'Ce ticket n\'a pas encore été vendu.', ticketStatus: params.ticketStatus, prizeAmount: null };
    }
    return { isValid: false, error: `Statut invalide: ${params.ticketStatus}`, ticketStatus: params.ticketStatus, prizeAmount: null };
  }
  
  // Vérifier le propriétaire
  if (params.ticketOwnerId !== params.requestingUserId) {
    return { isValid: false, error: 'Ce ticket ne vous appartient pas.', ticketStatus: params.ticketStatus, prizeAmount: null };
  }
  
  // Vérifier le code secret
  if (!params.secretValid) {
    return { isValid: false, error: 'Code secret invalide.', ticketStatus: params.ticketStatus, prizeAmount: null };
  }
  
  return { isValid: true, error: null, ticketStatus: params.ticketStatus, prizeAmount: null };
}

// ============================================================
// PROTECTION CONTRE LE DOUBLE RETRAIT
// ============================================================

export interface WithdrawalValidation {
  isValid: boolean;
  error: string | null;
  idempotencyCheck: 'NEW' | 'DUPLICATE' | 'RETRY';
}

export function validateWithdrawal(params: {
  idempotencyKey: string;
  existingKeys: string[];
  userBalance: number;
  amount: number;
  maxDailyWithdrawal: number;
  todayWithdrawals: number;
}): WithdrawalValidation {
  // Vérifier l'idempotence
  if (params.existingKeys.includes(params.idempotencyKey)) {
    return { isValid: false, error: 'Demande de retrait déjà traitée (clé d\'idempotence dupliquée).', idempotencyCheck: 'DUPLICATE' };
  }
  
  // Vérifier le solde
  if (params.amount > params.userBalance) {
    return { isValid: false, error: `Solde insuffisant. Disponible: ${params.userBalance.toLocaleString()} HTG, Demandé: ${params.amount.toLocaleString()} HTG.`, idempotencyCheck: 'NEW' };
  }
  
  // Vérifier la limite journalière
  if (params.todayWithdrawals + params.amount > params.maxDailyWithdrawal) {
    return { isValid: false, error: `Limite journalière dépassée. Max: ${params.maxDailyWithdrawal.toLocaleString()} HTG, Déjà retiré aujourd'hui: ${params.todayWithdrawals.toLocaleString()} HTG.`, idempotencyCheck: 'NEW' };
  }
  
  return { isValid: true, error: null, idempotencyCheck: 'NEW' };
}
