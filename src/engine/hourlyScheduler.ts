/**
 * SERVICE DE CYCLE HORAIRE - AZAKA CHANS
 * 
 * Mécanisme de renouvellement automatique des séries à intervalles d'une heure.
 * L'exécution est idempotente : deux exécutions simultanées ne créent jamais
 * de séries en double, ne dépassent pas les quotas et ne consomment pas deux
 * fois le même budget.
 */

import { Series, HourlyCycleExecution, FinancialSnapshot } from './types';
import { analyzeCoverage, checkPublicationEligibility, generateFinancialAlerts } from './financialEngine';
import { validateSeriesBudget, validateWinnerQuotas } from './financialEngine';

// ============================================================
// ÉTAT DU SERVICE (simulation)
// ============================================================

interface HourlySchedulerState {
  isRunning: boolean;
  currentCycleNumber: number;
  lastCompletedCycle: string | null;
  lockAcquiredAt: string | null;
  processedIdempotencyKeys: Set<string>;
}

const schedulerState: HourlySchedulerState = {
  isRunning: false,
  currentCycleNumber: 0,
  lastCompletedCycle: null,
  lockAcquiredAt: null,
  processedIdempotencyKeys: new Set(),
};

// ============================================================
// ACQUISITION DU VERROU (Idempotence)
// ============================================================

function acquireLock(idempotencyKey: string): boolean {
  // Vérifier si ce cycle a déjà été traité
  if (schedulerState.processedIdempotencyKeys.has(idempotencyKey)) {
    return false; // Déjà traité - idempotence
  }
  
  // Vérifier si un autre cycle est en cours
  if (schedulerState.isRunning) {
    return false; // Un cycle est déjà en cours d'exécution
  }
  
  // Acquérir le verrou
  schedulerState.isRunning = true;
  schedulerState.lockAcquiredAt = new Date().toISOString();
  schedulerState.processedIdempotencyKeys.add(idempotencyKey);
  
  return true;
}

function releaseLock(): void {
  schedulerState.isRunning = false;
  schedulerState.lockAcquiredAt = null;
}

// ============================================================
// EXÉCUTION D'UN CYCLE HORAIRE
// ============================================================

export function executeHourlyCycle(params: {
  currentSeries: Series[];
  financialSnapshot: FinancialSnapshot;
  minCoverageRatio: number;
  alertCoverageRatio: number;
  maxSeriesPerDay: number;
}): HourlyCycleExecution {
  const cycleNumber = schedulerState.currentCycleNumber + 1;
  const idempotencyKey = `cycle-${new Date().toISOString().split('T')[0]}-${String(cycleNumber).padStart(2, '0')}`;
  
  const execution: HourlyCycleExecution = {
    id: `hc-${Date.now()}`,
    cycleNumber,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'RUNNING',
    financialCheckPassed: false,
    previousSeriesReviewed: false,
    newSeriesPublished: false,
    seriesPublishedId: null,
    alertsGenerated: 0,
    errorsEncountered: [],
    idempotencyKey,
    lockAcquiredAt: null,
  };
  
  // Étape 1: Acquisition du verrou
  if (!acquireLock(idempotencyKey)) {
    execution.status = 'SKIPPED';
    execution.errorsEncountered.push('Cycle déjà traité ou un autre cycle est en cours (idempotence)');
    execution.completedAt = new Date().toISOString();
    return execution;
  }
  
  execution.lockAcquiredAt = schedulerState.lockAcquiredAt;
  
  try {
    // Étape 2: Vérification financière
    const coverage = analyzeCoverage({
      fundsAllocatedForPrizes: params.financialSnapshot.reservedForPrizes,
      validatedUnpaidGains: params.financialSnapshot.validatedUnpaidGains,
      pendingWithdrawals: params.financialSnapshot.pendingWithdrawals,
      estimatedFuturePrizes: 0,
      minCoverageRatio: params.minCoverageRatio,
      alertCoverageRatio: params.alertCoverageRatio,
    });
    
    execution.financialCheckPassed = coverage.isSolvent;
    
    if (!coverage.isSolvent) {
      execution.errorsEncountered.push(`Couverture insuffisante: ${(coverage.coverageRatio * 100).toFixed(1)}% < ${(params.minCoverageRatio * 100).toFixed(0)}%`);
    }
    
    // Étape 3: Vérification des séries précédentes
    const publishedSeries = params.currentSeries.filter(s => s.status === 'PUBLISHED');
    const soldOutSeries = publishedSeries.filter(s => s.ticketsSold >= s.totalTickets);
    
    execution.previousSeriesReviewed = true;
    
    // Vérifier si des séries sont épuisées
    for (const series of soldOutSeries) {
      // Marquer comme SOLD_OUT
      // En production: UPDATE series SET status = 'SOLD_OUT' WHERE id = ...
    }
    
    // Étape 4: Générer les alertes
    const alerts = generateFinancialAlerts({
      coverageRatio: coverage.coverageRatio,
      minCoverageRatio: params.minCoverageRatio,
      alertCoverageRatio: params.alertCoverageRatio,
      seriesList: params.currentSeries,
      config: {
        ticketCategories: [],
        prizeGrid: [],
        maxPrizeAmount: 100000,
        minPrizeAmount: 50,
        maxDailyWithdrawal: 50000,
        maxWithdrawalWithoutKYC: 10000,
        minCoverageRatio: params.minCoverageRatio,
        alertCoverageRatio: params.alertCoverageRatio,
        hourlyCycleEnabled: true,
        maxSeriesPerDay: params.maxSeriesPerDay,
        moncashEnabled: true,
        natcashEnabled: true,
      },
    });
    
    execution.alertsGenerated = alerts.length;
    
    // Étape 5: Préparer une nouvelle série (si couverture suffisante)
    if (coverage.isSolvent) {
      // Vérifier le nombre de séries publiées aujourd'hui
      const todayCycles = schedulerState.currentCycleNumber;
      if (todayCycles >= params.maxSeriesPerDay) {
        execution.errorsEncountered.push(`Nombre maximum de séries par jour atteint (${params.maxSeriesPerDay})`);
      } else {
        // En production: créer et valider une nouvelle série
        // Pour cette simulation, on vérifie juste les conditions
        execution.newSeriesPublished = false; // Pas de nouvelle série en démo
      }
    }
    
    // Étape 6: Finalisation
    execution.status = 'COMPLETED';
    execution.completedAt = new Date().toISOString();
    schedulerState.currentCycleNumber = cycleNumber;
    schedulerState.lastCompletedCycle = execution.id;
    
  } catch (error) {
    execution.status = 'FAILED';
    execution.completedAt = new Date().toISOString();
    execution.errorsEncountered.push(`Erreur inattendue: ${error instanceof Error ? error.message : 'Unknown'}`);
  } finally {
    releaseLock();
  }
  
  return execution;
}

// ============================================================
// VÉRIFICATION DE L'ÉTAT DU SCHEDULER
// ============================================================

export function getSchedulerStatus(): {
  isRunning: boolean;
  currentCycleNumber: number;
  lastCompletedCycle: string | null;
  processedCyclesCount: number;
} {
  return {
    isRunning: schedulerState.isRunning,
    currentCycleNumber: schedulerState.currentCycleNumber,
    lastCompletedCycle: schedulerState.lastCompletedCycle,
    processedCyclesCount: schedulerState.processedIdempotencyKeys.size,
  };
}

// ============================================================
// REPRISE APRÈS PANNE
// ============================================================

export function resumeAfterFailure(params: {
  lastSuccessfulCycle: number;
  existingSeries: Series[];
}): {
  canResume: boolean;
  nextCycleNumber: number;
  seriesToReview: string[];
} {
  // Vérifier que les résultats des tickets déjà vendus sont intacts
  const affectedSeries = params.existingSeries.filter(s => 
    s.status === 'PUBLISHED' && s.ticketsSold > 0
  );
  
  // Reprendre au prochain cycle
  const nextCycleNumber = params.lastSuccessfulCycle + 1;
  
  return {
    canResume: true,
    nextCycleNumber,
    seriesToReview: affectedSeries.map(s => s.id),
  };
}
