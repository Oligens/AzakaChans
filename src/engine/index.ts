/**
 * ChansAyiti Engine - Point d'entrée
 * 
 * Exporte tous les composants du moteur de loterie :
 * - Moteur financier (calculs, couverture, validation)
 * - Générateur de tickets (sécurisé, reproductible)
 * - Service de cycle horaire (idempotent)
 * - Service de registre comptable (réconciliation)
 * - Service de paiement (MonCash/NatCash)
 * - Service d'état de plateforme (états opérationnels)
 * - Service de réclamations (tickets contestés)
 * - Tests automatisés
 */

export * from './types';
export * from './financialEngine';
export * from './ticketGenerator';
export * from './hourlyScheduler';
export * from './ledgerService';
export * from './paymentService';
export * from './platformStateService';
export * from './claimService';
export * from './jackpotEngine';
export { getTestResults, runAllTests } from './tests';
