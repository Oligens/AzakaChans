/**
 * PLATFORM STATE SERVICE - AZAKA CHANS
 * 
 * Service de gestion des états opérationnels de la plateforme.
 * Responsabilités :
 * - Gérer les transitions entre états (NORMAL, WARNING, etc.)
 * - Appliquer les restrictions de vente selon l'état
 * - Déclencher les alertes appropriées
 * - Permettre la reprise après incident
 */

import { FinancialAlertLevel } from '../types';

// ============================================================
// TYPES
// ============================================================

export type PlatformState = 
  | 'NORMAL' 
  | 'WARNING' 
  | 'SALES_RESTRICTED' 
  | 'SALES_SUSPENDED' 
  | 'RECONCILIATION_REQUIRED';

export interface StateTransition {
  id: string;
  fromState: PlatformState;
  toState: PlatformState;
  reason: string;
  triggeredBy: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StateTransitionRule {
  fromState: PlatformState;
  toState: PlatformState;
  condition: (context: StateEvaluationContext) => boolean;
  automatic: boolean;
  requiresApproval: boolean;
  description: string;
}

export interface StateEvaluationContext {
  coverageRatio: number;
  minCoverageRatio: number;
  alertCoverageRatio: number;
  unresolvedAnomalies: number;
  failedPayments: number;
  pendingReconciliations: number;
  lastReconciliationSuccess: string | null;
}

export interface PlatformStatus {
  currentState: PlatformState;
  previousState: PlatformState | null;
  lastTransition: StateTransition | null;
  restrictions: StateRestrictions;
  alerts: PlatformAlert[];
  metrics: PlatformMetrics;
}

export interface StateRestrictions {
  canSellTickets: boolean;
  canCreateSeries: boolean;
  canProcessWithdrawals: boolean;
  canRevealTickets: boolean;
  allowedTicketCategories: number[]; // Prix autorisés (vide = tous)
  message: string;
}

export interface PlatformAlert {
  id: string;
  level: FinancialAlertLevel;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy: string | null;
}

export interface PlatformMetrics {
  uptime: number; // secondes
  lastStateChange: string;
  totalTransitions: number;
  automaticTransitions: number;
  manualTransitions: number;
}

// ============================================================
// RÈGLES DE TRANSITION
// ============================================================

const transitionRules: StateTransitionRule[] = [
  // NORMAL → WARNING
  {
    fromState: 'NORMAL',
    toState: 'WARNING',
    condition: (ctx) => ctx.coverageRatio < ctx.alertCoverageRatio && ctx.coverageRatio >= ctx.minCoverageRatio,
    automatic: true,
    requiresApproval: false,
    description: 'Couverture en dessous du seuil d\'alerte',
  },
  
  // WARNING → SALES_RESTRICTED
  {
    fromState: 'WARNING',
    toState: 'SALES_RESTRICTED',
    condition: (ctx) => ctx.coverageRatio < ctx.minCoverageRatio,
    automatic: true,
    requiresApproval: false,
    description: 'Couverture insuffisante - restriction des ventes',
  },
  
  // NORMAL → SALES_RESTRICTED
  {
    fromState: 'NORMAL',
    toState: 'SALES_RESTRICTED',
    condition: (ctx) => ctx.coverageRatio < ctx.minCoverageRatio,
    automatic: true,
    requiresApproval: false,
    description: 'Couverture critique - restriction immédiate',
  },
  
  // SALES_RESTRICTED → SALES_SUSPENDED
  {
    fromState: 'SALES_RESTRICTED',
    toState: 'SALES_SUSPENDED',
    condition: (ctx) => ctx.unresolvedAnomalies > 5 || ctx.failedPayments > 10,
    automatic: true,
    requiresApproval: false,
    description: 'Nombre critique d\'anomalies ou échecs de paiement',
  },
  
  // WARNING → SALES_SUSPENDED
  {
    fromState: 'WARNING',
    toState: 'SALES_SUSPENDED',
    condition: (ctx) => ctx.unresolvedAnomalies > 5 || ctx.failedPayments > 10,
    automatic: true,
    requiresApproval: false,
    description: 'Nombre critique d\'anomalies ou échecs de paiement',
  },
  
  // NORMAL → SALES_SUSPENDED
  {
    fromState: 'NORMAL',
    toState: 'SALES_SUSPENDED',
    condition: (ctx) => ctx.unresolvedAnomalies > 5 || ctx.failedPayments > 10,
    automatic: true,
    requiresApproval: false,
    description: 'Nombre critique d\'anomalies ou échecs de paiement',
  },
  
  // ANY → RECONCILIATION_REQUIRED
  {
    fromState: 'NORMAL',
    toState: 'RECONCILIATION_REQUIRED',
    condition: (ctx) => ctx.pendingReconciliations > 0 && ctx.lastReconciliationSuccess === null,
    automatic: true,
    requiresApproval: false,
    description: 'Divergence comptable détectée',
  },
  
  // RECONCILIATION_REQUIRED → NORMAL
  {
    fromState: 'RECONCILIATION_REQUIRED',
    toState: 'NORMAL',
    condition: (ctx) => ctx.pendingReconciliations === 0 && ctx.unresolvedAnomalies === 0,
    automatic: false,
    requiresApproval: true,
    description: 'Réconciliation complétée - reprise manuelle',
  },
  
  // SALES_SUSPENDED → NORMAL
  {
    fromState: 'SALES_SUSPENDED',
    toState: 'NORMAL',
    condition: (ctx) => ctx.coverageRatio >= ctx.alertCoverageRatio && ctx.unresolvedAnomalies === 0 && ctx.failedPayments === 0,
    automatic: false,
    requiresApproval: true,
    description: 'Conditions rétablies - reprise manuelle',
  },
  
  // SALES_RESTRICTED → NORMAL
  {
    fromState: 'SALES_RESTRICTED',
    toState: 'NORMAL',
    condition: (ctx) => ctx.coverageRatio >= ctx.alertCoverageRatio,
    automatic: true,
    requiresApproval: false,
    description: 'Couverture rétablie',
  },
  
  // WARNING → NORMAL
  {
    fromState: 'WARNING',
    toState: 'NORMAL',
    condition: (ctx) => ctx.coverageRatio >= ctx.alertCoverageRatio,
    automatic: true,
    requiresApproval: false,
    description: 'Couverture rétablie',
  },
];

// ============================================================
// GESTIONNAIRE D'ÉTAT
// ============================================================

class PlatformStateManager {
  private currentState: PlatformState = 'NORMAL';
  private previousState: PlatformState | null = null;
  private transitions: StateTransition[] = [];
  private alerts: PlatformAlert[] = [];
  private startTime: number = Date.now();

  // Obtenir l'état actuel
  getState(): PlatformState {
    return this.currentState;
  }

  // Obtenir le statut complet
  getStatus(): PlatformStatus {
    return {
      currentState: this.currentState,
      previousState: this.previousState,
      lastTransition: this.transitions[this.transitions.length - 1] || null,
      restrictions: this.getRestrictions(),
      alerts: this.alerts.filter(a => !a.acknowledged),
      metrics: this.getMetrics(),
    };
  }

  // Obtenir les restrictions selon l'état
  getRestrictions(): StateRestrictions {
    switch (this.currentState) {
      case 'NORMAL':
        return {
          canSellTickets: true,
          canCreateSeries: true,
          canProcessWithdrawals: true,
          canRevealTickets: true,
          allowedTicketCategories: [],
          message: 'Opérations normales',
        };
      
      case 'WARNING':
        return {
          canSellTickets: true,
          canCreateSeries: true,
          canProcessWithdrawals: true,
          canRevealTickets: true,
          allowedTicketCategories: [],
          message: 'Attention: couverture en dessous du seuil d\'alerte',
        };
      
      case 'SALES_RESTRICTED':
        return {
          canSellTickets: true,
          canCreateSeries: false,
          canProcessWithdrawals: true,
          canRevealTickets: true,
          allowedTicketCategories: [100, 250], // Seulement les petites catégories
          message: 'Ventes restreintes aux catégories à faible risque',
        };
      
      case 'SALES_SUSPENDED':
        return {
          canSellTickets: false,
          canCreateSeries: false,
          canProcessWithdrawals: false,
          canRevealTickets: true, // Les utilisateurs peuvent toujours révéler leurs tickets
          allowedTicketCategories: [],
          message: 'Ventes suspendues - Contactez le support',
        };
      
      case 'RECONCILIATION_REQUIRED':
        return {
          canSellTickets: false,
          canCreateSeries: false,
          canProcessWithdrawals: false,
          canRevealTickets: true,
          allowedTicketCategories: [],
          message: 'Investigation en cours - Reprise après validation',
        };
      
      default:
        return {
          canSellTickets: false,
          canCreateSeries: false,
          canProcessWithdrawals: false,
          canRevealTickets: false,
          allowedTicketCategories: [],
          message: 'État inconnu',
        };
    }
  }

  // Évaluer les transitions automatiques
  evaluateTransitions(context: StateEvaluationContext): StateTransition | null {
    for (const rule of transitionRules) {
      if (rule.fromState === this.currentState && rule.automatic && rule.condition(context)) {
        return this.transitionTo(rule.toState, rule.description, 'system', context);
      }
    }
    return null;
  }

  // Transition manuelle (avec approbation si nécessaire)
  manualTransition(params: {
    toState: PlatformState;
    reason: string;
    triggeredBy: string;
    metadata?: Record<string, any>;
  }): { success: boolean; transition?: StateTransition; error?: string } {
    // Vérifier si la transition est autorisée
    const rule = transitionRules.find(r => 
      r.fromState === this.currentState && 
      r.toState === params.toState
    );

    if (!rule) {
      return { success: false, error: 'Transition non autorisée' };
    }

    if (rule.requiresApproval) {
      // En production: vérifier que l'utilisateur a les permissions
      // Pour cette simulation, on accepte
    }

    const transition = this.transitionTo(params.toState, params.reason, params.triggeredBy, null, params.metadata);
    return { success: true, transition };
  }

  // Effectuer la transition
  private transitionTo(
    toState: PlatformState, 
    reason: string, 
    triggeredBy: string,
    context: StateEvaluationContext | null,
    metadata?: Record<string, any>
  ): StateTransition {
    const transition: StateTransition = {
      id: `trans-${Date.now()}`,
      fromState: this.currentState,
      toState,
      reason,
      triggeredBy,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.previousState = this.currentState;
    this.currentState = toState;
    this.transitions.push(transition);

    // Générer une alerte
    this.addAlert({
      level: toState === 'NORMAL' ? 'INFO' : toState === 'WARNING' ? 'WARNING' : 'CRITICAL',
      title: `Transition vers ${toState}`,
      message: reason,
    });

    return transition;
  }

  // Ajouter une alerte
  private addAlert(params: {
    level: FinancialAlertLevel;
    title: string;
    message: string;
  }): void {
    const alert: PlatformAlert = {
      id: `alert-${Date.now()}`,
      level: params.level,
      title: params.title,
      message: params.message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      acknowledgedBy: null,
    };
    this.alerts.push(alert);
  }

  // Acquitter une alerte
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    return true;
  }

  // Obtenir les métriques
  private getMetrics(): PlatformMetrics {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const lastTransition = this.transitions[this.transitions.length - 1];
    
    return {
      uptime,
      lastStateChange: lastTransition?.timestamp || new Date(this.startTime).toISOString(),
      totalTransitions: this.transitions.length,
      automaticTransitions: this.transitions.filter(t => t.triggeredBy === 'system').length,
      manualTransitions: this.transitions.filter(t => t.triggeredBy !== 'system').length,
    };
  }

  // Obtenir l'historique des transitions
  getTransitionHistory(): StateTransition[] {
    return this.transitions;
  }

  // Obtenir les alertes
  getAlerts(acknowledged?: boolean): PlatformAlert[] {
    if (acknowledged === undefined) {
      return this.alerts;
    }
    return this.alerts.filter(a => a.acknowledged === acknowledged);
  }
}

const stateManager = new PlatformStateManager();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Obtenir l'état actuel de la plateforme
 */
export function getPlatformState(): PlatformState {
  return stateManager.getState();
}

/**
 * Obtenir le statut complet de la plateforme
 */
export function getPlatformStatus(): PlatformStatus {
  return stateManager.getStatus();
}

/**
 * Obtenir les restrictions actuelles
 */
export function getRestrictions(): StateRestrictions {
  return stateManager.getRestrictions();
}

/**
 * Évaluer les transitions automatiques
 */
export function evaluateTransitions(context: StateEvaluationContext): StateTransition | null {
  return stateManager.evaluateTransitions(context);
}

/**
 * Effectuer une transition manuelle
 */
export function manualTransition(params: {
  toState: PlatformState;
  reason: string;
  triggeredBy: string;
  metadata?: Record<string, any>;
}): { success: boolean; transition?: StateTransition; error?: string } {
  return stateManager.manualTransition(params);
}

/**
 * Acquitter une alerte
 */
export function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
  return stateManager.acknowledgeAlert(alertId, acknowledgedBy);
}

/**
 * Obtenir l'historique des transitions
 */
export function getTransitionHistory(): StateTransition[] {
  return stateManager.getTransitionHistory();
}

/**
 * Obtenir les alertes
 */
export function getAlerts(acknowledged?: boolean): PlatformAlert[] {
  return stateManager.getAlerts(acknowledged);
}

/**
 * Vérifier si une opération est autorisée
 */
export function isOperationAllowed(operation: 'SELL_TICKET' | 'CREATE_SERIES' | 'PROCESS_WITHDRAWAL' | 'REVEAL_TICKET'): boolean {
  const restrictions = stateManager.getRestrictions();
  
  switch (operation) {
    case 'SELL_TICKET':
      return restrictions.canSellTickets;
    case 'CREATE_SERIES':
      return restrictions.canCreateSeries;
    case 'PROCESS_WITHDRAWAL':
      return restrictions.canProcessWithdrawals;
    case 'REVEAL_TICKET':
      return restrictions.canRevealTickets;
    default:
      return false;
  }
}

/**
 * Vérifier si une catégorie de ticket est autorisée
 */
export function isTicketCategoryAllowed(price: number): boolean {
  const restrictions = stateManager.getRestrictions();
  
  if (!restrictions.canSellTickets) {
    return false;
  }
  
  if (restrictions.allowedTicketCategories.length === 0) {
    return true; // Toutes les catégories sont autorisées
  }
  
  return restrictions.allowedTicketCategories.includes(price);
}
