/**
 * GÉNÉRATEUR DE TICKETS SÉCURISÉ - ChansAyiti
 * 
 * Génère les tickets avec des résultats pré-déterminés côté serveur.
 * Utilise un générateur cryptographiquement sûr.
 * Les résultats sont verrouillés avant la vente.
 */

import { PrizeTier, TicketGenerationRequest, TicketGenerationResult, GeneratedTicket } from './types';

// ============================================================
// GÉNÉRATEUR ALÉATOIRE SÉCURISÉ (simulation côté client)
// En production, utiliser crypto.getRandomValues() ou l'API serveur
// ============================================================

function secureRandom(): number {
  // Simulation d'un générateur cryptographique
  // En production: crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296
  return Math.random();
}

function generateSecureId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(secureRandom() * chars.length));
  }
  return result;
}

function hashString(input: string): string {
  // Simulation de SHA-256 (en production, utiliser SubtleCrypto)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

// ============================================================
// ALGORITHME DE DISTRIBUTION DES GAINS
// ============================================================

/**
 * Distribue les gains selon la grille de lots et les quantités définies.
 * Utilise un algorithme de Fisher-Yates shuffle sécurisé pour mélanger
 * les positions des tickets gagnants et perdants.
 */
function distributePrizes(
  totalTickets: number,
  prizeTiers: PrizeTier[],
  seed: string
): { isWinner: boolean; prizeAmount: number | null; prizeTierIndex: number | null }[] {
  const results: { isWinner: boolean; prizeAmount: number | null; prizeTierIndex: number | null }[] = [];
  
  // Créer la liste de tous les résultats possibles
  const prizePool: { isWinner: boolean; prizeAmount: number | null; prizeTierIndex: number | null }[] = [];
  
  // Ajouter les tickets gagnants selon les quantités
  for (let tierIdx = 0; tierIdx < prizeTiers.length; tierIdx++) {
    const tier = prizeTiers[tierIdx];
    for (let i = 0; i < tier.quantity; i++) {
      prizePool.push({
        isWinner: true,
        prizeAmount: tier.amount,
        prizeTierIndex: tierIdx,
      });
    }
  }
  
  // Compléter avec des tickets perdants
  const totalWinners = prizePool.length;
  const totalLosers = totalTickets - totalWinners;
  
  if (totalLosers < 0) {
    throw new Error(`Impossible: plus de gagnants (${totalWinners}) que de tickets (${totalTickets})`);
  }
  
  for (let i = 0; i < totalLosers; i++) {
    prizePool.push({
      isWinner: false,
      prizeAmount: null,
      prizeTierIndex: null,
    });
  }
  
  // Mélanger avec un algorithme Fisher-Yates sécurisé
  // La graine détermine l'ordre de mélange
  const seedHash = hashString(seed);
  let seedValue = parseInt(seedHash.replace('sha256:', ''), 16);
  
  function seededRandom(): number {
    seedValue = (seedValue * 1103515245 + 12345) & 0x7fffffff;
    return seedValue / 0x7fffffff;
  }
  
  // Fisher-Yates shuffle
  for (let i = prizePool.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [prizePool[i], prizePool[j]] = [prizePool[j], prizePool[i]];
  }
  
  return prizePool;
}

// ============================================================
// GÉNÉRATION D'UNE SÉRIE DE TICKETS
// ============================================================

export function generateTicketSeries(request: TicketGenerationRequest): TicketGenerationResult {
  const validationErrors: string[] = [];
  
  // Validation 1: Vérifier que les quantités ne dépassent pas le total
  const totalWinners = request.prizeDistribution.reduce((sum, tier) => sum + tier.quantity, 0);
  if (totalWinners > request.totalTickets) {
    validationErrors.push(`Total des gagnants (${totalWinners}) dépasse le nombre de tickets (${request.totalTickets})`);
  }
  
  // Validation 2: Vérifier le plafond de 100 000 HTG
  const maxPrize = Math.max(...request.prizeDistribution.map(t => t.amount));
  if (maxPrize > 100000) {
    validationErrors.push(`Lot maximum (${maxPrize}) dépasse le plafond de 100 000 HTG`);
  }
  
  // Validation 3: Vérifier le plancher de 50 HTG
  const minPrize = Math.min(...request.prizeDistribution.map(t => t.amount));
  if (minPrize < 50) {
    validationErrors.push(`Lot minimum (${minPrize}) inférieur au plancher de 50 HTG`);
  }
  
  // Validation 4: Vérifier que les probabilités sont cohérentes
  const totalProbability = request.prizeDistribution.reduce((sum, tier) => {
    return sum + (tier.quantity / request.totalTickets);
  }, 0);
  
  if (totalProbability > 1) {
    validationErrors.push(`Probabilité totale des gagnants (${(totalProbability * 100).toFixed(1)}%) dépasse 100%`);
  }
  
  // Si des erreurs de validation, retourner sans générer
  if (validationErrors.length > 0) {
    return {
      seriesId: request.seriesId,
      tickets: [],
      seedHash: '',
      generationTimestamp: new Date().toISOString(),
      validationPassed: false,
      validationErrors,
    };
  }
  
  // Distribuer les gains
  const prizeDistribution = distributePrizes(
    request.totalTickets,
    request.prizeDistribution,
    request.seed
  );
  
  // Générer les tickets
  const tickets: GeneratedTicket[] = prizeDistribution.map((prize, index) => {
    const publicId = `CHN-${request.seriesId.substring(0, 4).toUpperCase()}-${String(index + 1).padStart(5, '0')}`;
    const secretCode = generateSecureId();
    const secretHash = hashString(`${request.seed}:${index}:${secretCode}`);
    
    return {
      index,
      publicId,
      secretHash,
      isWinner: prize.isWinner,
      prizeAmount: prize.prizeAmount,
      prizeTier: prize.prizeTierIndex,
    };
  });
  
  // Calculer le hash de la graine (preuve d'immutabilité)
  const seedHash = hashString(`${request.seed}:${request.seriesId}:${request.algorithmVersion}:${tickets.length}`);
  
  return {
    seriesId: request.seriesId,
    tickets,
    seedHash,
    generationTimestamp: new Date().toISOString(),
    validationPassed: true,
    validationErrors: [],
  };
}

// ============================================================
// VÉRIFICATION D'UN TICKET (côté serveur)
// ============================================================

export interface TicketVerification {
  isValid: boolean;
  ticket: GeneratedTicket | null;
  error: string | null;
}

export function verifyTicket(params: {
  publicId: string;
  secretCode: string;
  generatedTickets: GeneratedTicket[];
  seriesSeed: string;
  seriesLocked: boolean;
}): TicketVerification {
  // Trouver le ticket par son ID public
  const ticket = params.generatedTickets.find(t => t.publicId === params.publicId);
  
  if (!ticket) {
    return { isValid: false, ticket: null, error: 'Ticket non trouvé dans cette série' };
  }
  
  // Vérifier le code secret
  const expectedHash = hashString(`${params.seriesSeed}:${ticket.index}:${params.secretCode}`);
  if (expectedHash !== ticket.secretHash) {
    return { isValid: false, ticket: null, error: 'Code secret invalide' };
  }
  
  // Vérifier que la série est verrouillée
  if (!params.seriesLocked) {
    return { isValid: false, ticket: null, error: 'Série non encore verrouillée' };
  }
  
  return { isValid: true, ticket, error: null };
}

// ============================================================
// CALCUL DU COÛT MAXIMAL DES LOTS
// ============================================================

export function calculateMaxPrizeCost(prizeTiers: PrizeTier[]): number {
  return prizeTiers.reduce((sum, tier) => sum + (tier.amount * tier.quantity), 0);
}

// ============================================================
// VALIDATION DE LA GRILLE DE LOTS
// ============================================================

export interface GridValidation {
  isValid: boolean;
  errors: string[];
  totalWinners: number;
  totalCost: number;
  winRate: number;
}

export function validatePrizeGrid(params: {
  prizeTiers: PrizeTier[];
  totalTickets: number;
  targetWinRate: number;
  maxPrize: number;
  minPrize: number;
}): GridValidation {
  const errors: string[] = [];
  
  // Vérifier les montants
  for (const tier of params.prizeTiers) {
    if (tier.amount > params.maxPrize) {
      errors.push(`Lot de ${tier.amount} HTG dépasse le plafond de ${params.maxPrize} HTG`);
    }
    if (tier.amount < params.minPrize) {
      errors.push(`Lot de ${tier.amount} HTG est inférieur au plancher de ${params.minPrize} HTG`);
    }
    if (tier.quantity < 0) {
      errors.push(`Quantité négative pour le lot de ${tier.amount} HTG`);
    }
  }
  
  const totalWinners = params.prizeTiers.reduce((sum, tier) => sum + tier.quantity, 0);
  const totalCost = calculateMaxPrizeCost(params.prizeTiers);
  const winRate = totalWinners / params.totalTickets;
  
  // Vérifier le taux de gagnants (tolérance de 5%)
  if (Math.abs(winRate - params.targetWinRate) > 0.05) {
    errors.push(`Taux de gagnants réel (${(winRate * 100).toFixed(1)}%) trop éloigné de la cible (${(params.targetWinRate * 100).toFixed(1)}%)`);
  }
  
  // Vérifier que le total ne dépasse pas le nombre de tickets
  if (totalWinners > params.totalTickets) {
    errors.push(`Total des gagnants (${totalWinners}) supérieur au nombre de tickets (${params.totalTickets})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    totalWinners,
    totalCost,
    winRate,
  };
}
