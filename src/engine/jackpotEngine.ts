/**
 * JACKPOT ENGINE - AZAKA CHANS
 * 
 * Moteur de jackpot itinérant avec machine à états stricte.
 * 
 * Règles métier:
 * - Montant unique: 100 000 HTG
 * - Catégories: 50 → 250 → 500 → 1 000 → 50 (cycle)
 * - Financement intégral obligatoire avant activation
 * - Blocage si réserve insuffisante
 * - Immutabilité des gains acquis
 * - Idempotence des victoires et paiements
 */

// ============================================================
// TYPES
// ============================================================

export type JackpotCategory = 50 | 250 | 500 | 1000;

export type JackpotState = 
  | 'RESERVE_INSUFFISANTE'
  | 'PRET'
  | 'ACTIF_50'
  | 'ACTIF_250'
  | 'ACTIF_500'
  | 'ACTIF_1000'
  | 'VICTOIRE_EN_COURS'
  | 'PAIEMENT_EN_ATTENTE'
  | 'PAIEMENT_ECHOUE';

export interface JackpotConfig {
  amount: number;                    // 100 000 HTG
  categories: JackpotCategory[];     // [50, 250, 500, 1000]
  currentCategoryIndex: number;      // Index dans le cycle
  version: string;                   // Version de la configuration
}

export interface JackpotState_ {
  state: JackpotState;
  currentCategory: JackpotCategory | null;
  reserveBalance: number;
  requiredReserve: number;           // 100 000 HTG
  lastTransition: string | null;
  lastVictory: JackpotVictory | null;
  version: string;
}

export interface JackpotVictory {
  id: string;
  ticketId: string;
  ticketPublicId: string;
  userId: string;
  userName: string;
  category: JackpotCategory;
  amount: number;                    // 100 000 HTG
  wonAt: string;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  paymentId: string | null;
  providerTransactionId: string | null;
  paidAt: string | null;
  idempotencyKey: string;
}

export interface JackpotTransition {
  id: string;
  fromState: JackpotState;
  toState: JackpotState;
  fromCategory: JackpotCategory | null;
  toCategory: JackpotCategory | null;
  reason: string;
  triggeredBy: string;
  timestamp: string;
  reserveBalanceBefore: number;
  reserveBalanceAfter: number;
  metadata?: Record<string, any>;
}

export interface JackpotEvent {
  id: string;
  type: 'ACTIVATED' | 'VICTORY' | 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'TRANSITION' | 'RESERVE_UPDATED';
  state: JackpotState;
  category: JackpotCategory | null;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ============================================================
// CONFIGURATION INITIALE
// ============================================================

const JACKPOT_AMOUNT = 100000; // 100 000 HTG
const CATEGORIES: JackpotCategory[] = [50, 250, 500, 1000];

// ============================================================
// GESTIONNAIRE DE JACKPOT
// ============================================================

class JackpotManager {
  private state: JackpotState_ = {
    state: 'RESERVE_INSUFFISANTE',
    currentCategory: null,
    reserveBalance: 0,
    requiredReserve: JACKPOT_AMOUNT,
    lastTransition: null,
    lastVictory: null,
    version: '1.0.0',
  };

  private transitions: JackpotTransition[] = [];
  private victories: JackpotVictory[] = [];
  private events: JackpotEvent[] = [];
  private idempotencyKeys: Set<string> = new Set();
  private categoryIndex: number = 0;

  // Obtenir l'état actuel
  getState(): JackpotState_ {
    return { ...this.state };
  }

  // Obtenir la configuration
  getConfig(): JackpotConfig {
    return {
      amount: JACKPOT_AMOUNT,
      categories: CATEGORIES,
      currentCategoryIndex: this.categoryIndex,
      version: this.state.version,
    };
  }

  // Mettre à jour la réserve
  updateReserve(params: {
    amount: number;
    reason: string;
    updatedBy: string;
  }): { success: boolean; error?: string } {
    if (params.amount < 0) {
      return { success: false, error: 'Montant négatif non autorisé' };
    }

    const oldBalance = this.state.reserveBalance;
    this.state.reserveBalance = params.amount;

    // Enregistrer l'événement
    this.addEvent({
      type: 'RESERVE_UPDATED',
      state: this.state.state,
      category: this.state.currentCategory,
      description: `Réserve mise à jour: ${oldBalance} → ${params.amount} HTG`,
      timestamp: new Date().toISOString(),
      metadata: { oldBalance, newBalance: params.amount, reason: params.reason },
    });

    // Vérifier si on peut activer
    if (params.amount >= JACKPOT_AMOUNT && this.state.state === 'RESERVE_INSUFFISANTE') {
      this.transitionTo('PRET', 'Réserve suffisante', params.updatedBy);
    } else if (params.amount < JACKPOT_AMOUNT && this.state.state === 'PRET') {
      this.transitionTo('RESERVE_INSUFFISANTE', 'Réserve insuffisante', params.updatedBy);
    }

    return { success: true };
  }

  // Activer le jackpot pour la catégorie courante
  activate(triggeredBy: string): { success: boolean; error?: string } {
    if (this.state.state !== 'PRET') {
      return { success: false, error: `État invalide: ${this.state.state}. Attendu: PRET` };
    }

    if (this.state.reserveBalance < JACKPOT_AMOUNT) {
      return { success: false, error: `Réserve insuffisante: ${this.state.reserveBalance} < ${JACKPOT_AMOUNT}` };
    }

    const category = CATEGORIES[this.categoryIndex];
    const targetState = `ACTIF_${category}` as JackpotState;

    this.state.currentCategory = category;
    this.transitionTo(targetState, `Activation jackpot catégorie ${category} HTG`, triggeredBy);

    return { success: true };
  }

  // Enregistrer une victoire
  recordVictory(params: {
    ticketId: string;
    ticketPublicId: string;
    userId: string;
    userName: string;
    idempotencyKey: string;
  }): { success: boolean; victory?: JackpotVictory; error?: string } {
    // Vérifier l'idempotence
    if (this.idempotencyKeys.has(params.idempotencyKey)) {
      return { success: false, error: 'Victoire déjà enregistrée (idempotence)' };
    }

    // Vérifier l'état
    if (!this.state.state.startsWith('ACTIF_')) {
      return { success: false, error: `Jackpot non actif: ${this.state.state}` };
    }

    if (!this.state.currentCategory) {
      return { success: false, error: 'Aucune catégorie active' };
    }

    // Vérifier la réserve
    if (this.state.reserveBalance < JACKPOT_AMOUNT) {
      return { success: false, error: `Réserve insuffisante pour payer: ${this.state.reserveBalance} < ${JACKPOT_AMOUNT}` };
    }

    // Créer la victoire
    const victory: JackpotVictory = {
      id: `jv-${Date.now()}`,
      ticketId: params.ticketId,
      ticketPublicId: params.ticketPublicId,
      userId: params.userId,
      userName: params.userName,
      category: this.state.currentCategory,
      amount: JACKPOT_AMOUNT,
      wonAt: new Date().toISOString(),
      paymentStatus: 'PENDING',
      paymentId: null,
      providerTransactionId: null,
      paidAt: null,
      idempotencyKey: params.idempotencyKey,
    };

    this.victories.push(victory);
    this.idempotencyKeys.add(params.idempotencyKey);
    this.state.lastVictory = victory;

    // Déduire de la réserve
    this.state.reserveBalance -= JACKPOT_AMOUNT;

    // Transition vers VICTOIRE_EN_COURS
    this.transitionTo('VICTOIRE_EN_COURS', `Victoire enregistrée: ticket ${params.ticketPublicId}`, 'system');

    // Enregistrer l'événement
    this.addEvent({
      type: 'VICTORY',
      state: this.state.state,
      category: this.state.currentCategory,
      description: `Victoire jackpot: ${params.userName} - ${JACKPOT_AMOUNT.toLocaleString()} HTG`,
      timestamp: new Date().toISOString(),
      metadata: { victoryId: victory.id, ticketId: params.ticketId },
    });

    return { success: true, victory };
  }

  // Initier le paiement
  initiatePayment(params: {
    victoryId: string;
    paymentId: string;
    triggeredBy: string;
  }): { success: boolean; error?: string } {
    const victory = this.victories.find(v => v.id === params.victoryId);
    if (!victory) {
      return { success: false, error: 'Victoire non trouvée' };
    }

    if (victory.paymentStatus !== 'PENDING') {
      return { success: false, error: `Statut de paiement invalide: ${victory.paymentStatus}` };
    }

    victory.paymentStatus = 'PROCESSING';
    victory.paymentId = params.paymentId;

    this.transitionTo('PAIEMENT_EN_ATTENTE', `Paiement initié pour victoire ${victory.id}`, params.triggeredBy);

    this.addEvent({
      type: 'PAYMENT_INITIATED',
      state: this.state.state,
      category: victory.category,
      description: `Paiement initié: ${JACKPOT_AMOUNT.toLocaleString()} HTG`,
      timestamp: new Date().toISOString(),
      metadata: { victoryId: victory.id, paymentId: params.paymentId },
    });

    return { success: true };
  }

  // Confirmer le paiement
  confirmPayment(params: {
    victoryId: string;
    providerTransactionId: string;
    confirmedBy: string;
  }): { success: boolean; error?: string } {
    const victory = this.victories.find(v => v.id === params.victoryId);
    if (!victory) {
      return { success: false, error: 'Victoire non trouvée' };
    }

    if (victory.paymentStatus !== 'PROCESSING') {
      return { success: false, error: `Statut de paiement invalide: ${victory.paymentStatus}` };
    }

    victory.paymentStatus = 'PAID';
    victory.providerTransactionId = params.providerTransactionId;
    victory.paidAt = new Date().toISOString();

    this.addEvent({
      type: 'PAYMENT_COMPLETED',
      state: this.state.state,
      category: victory.category,
      description: `Paiement confirmé: ${JACKPOT_AMOUNT.toLocaleString()} HTG`,
      timestamp: new Date().toISOString(),
      metadata: { victoryId: victory.id, providerTransactionId: params.providerTransactionId },
    });

    // Préparer la transition vers la catégorie suivante
    this.prepareNextCategory(params.confirmedBy);

    return { success: true };
  }

  // Échec du paiement
  failPayment(params: {
    victoryId: string;
    reason: string;
    failedBy: string;
  }): { success: boolean; error?: string } {
    const victory = this.victories.find(v => v.id === params.victoryId);
    if (!victory) {
      return { success: false, error: 'Victoire non trouvée' };
    }

    if (victory.paymentStatus !== 'PROCESSING') {
      return { success: false, error: `Statut de paiement invalide: ${victory.paymentStatus}` };
    }

    victory.paymentStatus = 'FAILED';

    this.transitionTo('PAIEMENT_ECHOUE', `Échec paiement: ${params.reason}`, params.failedBy);

    this.addEvent({
      type: 'PAYMENT_FAILED',
      state: this.state.state,
      category: victory.category,
      description: `Échec paiement: ${params.reason}`,
      timestamp: new Date().toISOString(),
      metadata: { victoryId: victory.id, reason: params.reason },
    });

    return { success: true };
  }

  // Préparer la catégorie suivante
  private prepareNextCategory(triggeredBy: string): void {
    // Passer à la catégorie suivante
    this.categoryIndex = (this.categoryIndex + 1) % CATEGORIES.length;
    const nextCategory = CATEGORIES[this.categoryIndex];

    // Vérifier si la réserve est suffisante pour la prochaine activation
    if (this.state.reserveBalance >= JACKPOT_AMOUNT) {
      this.transitionTo('PRET', `Prêt pour catégorie ${nextCategory} HTG`, triggeredBy);
    } else {
      this.transitionTo('RESERVE_INSUFFISANTE', `Réserve insuffisante pour catégorie ${nextCategory} HTG`, triggeredBy);
    }

    this.state.currentCategory = null;
  }

  // Effectuer une transition
  private transitionTo(toState: JackpotState, reason: string, triggeredBy: string): void {
    const transition: JackpotTransition = {
      id: `jt-${Date.now()}`,
      fromState: this.state.state,
      toState,
      fromCategory: this.state.currentCategory,
      toCategory: toState.startsWith('ACTIF_') ? this.state.currentCategory : null,
      reason,
      triggeredBy,
      timestamp: new Date().toISOString(),
      reserveBalanceBefore: this.state.reserveBalance,
      reserveBalanceAfter: this.state.reserveBalance,
    };

    this.transitions.push(transition);
    this.state.state = toState;
    this.state.lastTransition = transition.id;

    this.addEvent({
      type: 'TRANSITION',
      state: toState,
      category: this.state.currentCategory,
      description: `Transition: ${transition.fromState} → ${toState}`,
      timestamp: transition.timestamp,
      metadata: { transitionId: transition.id, reason },
    });
  }

  // Ajouter un événement
  private addEvent(event: Omit<JackpotEvent, 'id'>): void {
    this.events.push({
      ...event,
      id: `je-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    });
  }

  // Obtenir l'historique des transitions
  getTransitions(): JackpotTransition[] {
    return this.transitions;
  }

  // Obtenir les victoires
  getVictories(): JackpotVictory[] {
    return this.victories;
  }

  // Obtenir une victoire spécifique
  getVictory(victoryId: string): JackpotVictory | null {
    return this.victories.find(v => v.id === victoryId) || null;
  }

  // Obtenir les événements
  getEvents(): JackpotEvent[] {
    return this.events;
  }

  // Vérifier si une catégorie peut être activée
  canActivateCategory(category: JackpotCategory): boolean {
    return this.state.state === 'PRET' && 
           this.state.reserveBalance >= JACKPOT_AMOUNT &&
           CATEGORIES[this.categoryIndex] === category;
  }

  // Obtenir la prochaine catégorie
  getNextCategory(): JackpotCategory {
    return CATEGORIES[this.categoryIndex];
  }
}

const jackpotManager = new JackpotManager();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Obtenir l'état actuel du jackpot
 */
export function getJackpotState(): JackpotState_ {
  return jackpotManager.getState();
}

/**
 * Obtenir la configuration du jackpot
 */
export function getJackpotConfig(): JackpotConfig {
  return jackpotManager.getConfig();
}

/**
 * Mettre à jour la réserve
 */
export function updateJackpotReserve(params: {
  amount: number;
  reason: string;
  updatedBy: string;
}): { success: boolean; error?: string } {
  return jackpotManager.updateReserve(params);
}

/**
 * Activer le jackpot pour la catégorie courante
 */
export function activateJackpot(triggeredBy: string): { success: boolean; error?: string } {
  return jackpotManager.activate(triggeredBy);
}

/**
 * Enregistrer une victoire
 */
export function recordJackpotVictory(params: {
  ticketId: string;
  ticketPublicId: string;
  userId: string;
  userName: string;
  idempotencyKey: string;
}): { success: boolean; victory?: JackpotVictory; error?: string } {
  return jackpotManager.recordVictory(params);
}

/**
 * Initier le paiement d'une victoire
 */
export function initiateJackpotPayment(params: {
  victoryId: string;
  paymentId: string;
  triggeredBy: string;
}): { success: boolean; error?: string } {
  return jackpotManager.initiatePayment(params);
}

/**
 * Confirmer le paiement d'une victoire
 */
export function confirmJackpotPayment(params: {
  victoryId: string;
  providerTransactionId: string;
  confirmedBy: string;
}): { success: boolean; error?: string } {
  return jackpotManager.confirmPayment(params);
}

/**
 * Échec du paiement d'une victoire
 */
export function failJackpotPayment(params: {
  victoryId: string;
  reason: string;
  failedBy: string;
}): { success: boolean; error?: string } {
  return jackpotManager.failPayment(params);
}

/**
 * Obtenir l'historique des transitions
 */
export function getJackpotTransitions(): JackpotTransition[] {
  return jackpotManager.getTransitions();
}

/**
 * Obtenir les victoires
 */
export function getJackpotVictories(): JackpotVictory[] {
  return jackpotManager.getVictories();
}

/**
 * Obtenir une victoire spécifique
 */
export function getJackpotVictory(victoryId: string): JackpotVictory | null {
  return jackpotManager.getVictory(victoryId);
}

/**
 * Obtenir les événements
 */
export function getJackpotEvents(): JackpotEvent[] {
  return jackpotManager.getEvents();
}

/**
 * Vérifier si une catégorie peut être activée
 */
export function canActivateJackpotCategory(category: JackpotCategory): boolean {
  return jackpotManager.canActivateCategory(category);
}

/**
 * Obtenir la prochaine catégorie
 */
export function getNextJackpotCategory(): JackpotCategory {
  return jackpotManager.getNextCategory();
}
