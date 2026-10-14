/**
 * ChansAyiti Engine - Point d'entrée
 * 
 * Exporte tous les composants du moteur de loterie :
 * - Moteur financier (calculs, couverture, validation)
 * - Générateur de tickets (sécurisé, reproductible)
 * - Service de cycle horaire (idempotent)
 * - Tests automatisés
 */

export * from './types';
export * from './financialEngine';
export * from './ticketGenerator';
export * from './hourlyScheduler';
export { getTestResults, runAllTests } from './tests';
