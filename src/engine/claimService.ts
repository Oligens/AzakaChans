/**
 * CLAIM SERVICE - ChansAyiti
 * 
 * Service de gestion des réclamations et tickets contestés.
 * Responsabilités :
 * - Enregistrer les réclamations des utilisateurs
 * - Gérer le processus d'investigation
 * - Prendre des décisions (remboursement, validation, rejet)
 * - Maintenir la traçabilité des réclamations
 */

// ============================================================
// TYPES
// ============================================================

export type ClaimStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'INVESTIGATING' 
  | 'RESOLVED' 
  | 'REJECTED' 
  | 'REFUNDED';

export type ClaimType = 
  | 'TICKET_NOT_REVEALED' 
  | 'TICKET_INVALID' 
  | 'WRONG_PRIZE_AMOUNT' 
  | 'PAYMENT_NOT_RECEIVED' 
  | 'WITHDRAWAL_NOT_PROCESSED' 
  | 'OTHER';

export interface Claim {
  id: string;
  userId: string;
  userName: string;
  type: ClaimType;
  status: ClaimStatus;
  ticketId: string | null;
  ticketPublicId: string | null;
  description: string;
  evidence: ClaimEvidence[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Timeline
  submittedAt: string;
  acknowledgedAt: string | null;
  investigationStartedAt: string | null;
  resolvedAt: string | null;
  
  // Investigation
  assignedTo: string | null;
  investigationNotes: InvestigationNote[];
  
  // Resolution
  resolution: ClaimResolution | null;
  
  // Metadata
  relatedTransactionIds: string[];
  relatedWithdrawalIds: string[];
}

export interface ClaimEvidence {
  id: string;
  type: 'SCREENSHOT' | 'RECEIPT' | 'LOG' | 'OTHER';
  description: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface InvestigationNote {
  id: string;
  author: string;
  authorRole: 'USER' | 'ADMIN' | 'SUPPORT';
  note: string;
  createdAt: string;
  isPublic: boolean; // Visible par l'utilisateur ou interne seulement
}

export interface ClaimResolution {
  type: 'REJECTED' | 'REFUNDED' | 'TICKET_VALIDATED' | 'MANUAL_CREDIT' | 'OTHER';
  description: string;
  amount: number | null;
  resolvedBy: string;
  resolvedAt: string;
  approvedBy: string | null;
}

export interface ClaimStatistics {
  totalClaims: number;
  byStatus: Record<ClaimStatus, number>;
  byType: Record<ClaimType, number>;
  byPriority: Record<string, number>;
  averageResolutionTime: number; // heures
  refundRate: number; // pourcentage
}

// ============================================================
// GESTIONNAIRE DE RÉCLAMATIONS
// ============================================================

class ClaimManager {
  private claims: Map<string, Claim> = new Map();
  private claimCounter: number = 0;

  // Soumettre une réclamation
  submitClaim(params: {
    userId: string;
    userName: string;
    type: ClaimType;
    ticketId: string | null;
    ticketPublicId: string | null;
    description: string;
    evidence: Omit<ClaimEvidence, 'id' | 'uploadedAt'>[];
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Claim {
    this.claimCounter++;
    const id = `CLM-${String(this.claimCounter).padStart(6, '0')}`;
    
    const evidence: ClaimEvidence[] = params.evidence.map((e, i) => ({
      ...e,
      id: `ev-${id}-${i}`,
      uploadedAt: new Date().toISOString(),
    }));

    const claim: Claim = {
      id,
      userId: params.userId,
      userName: params.userName,
      type: params.type,
      status: 'SUBMITTED',
      ticketId: params.ticketId,
      ticketPublicId: params.ticketPublicId,
      description: params.description,
      evidence,
      priority: params.priority,
      submittedAt: new Date().toISOString(),
      acknowledgedAt: null,
      investigationStartedAt: null,
      resolvedAt: null,
      assignedTo: null,
      investigationNotes: [],
      resolution: null,
      relatedTransactionIds: [],
      relatedWithdrawalIds: [],
    };

    this.claims.set(id, claim);
    return claim;
  }

  // Acquitter une réclamation
  acknowledgeClaim(claimId: string, acknowledgedBy: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    claim.acknowledgedAt = new Date().toISOString();
    claim.assignedTo = acknowledgedBy;
    
    this.addNote(claimId, {
      author: acknowledgedBy,
      authorRole: 'ADMIN',
      note: 'Réclamation acquittée et assignée',
      isPublic: true,
    });

    return true;
  }

  // Démarrer l'investigation
  startInvestigation(claimId: string, investigator: string): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    claim.status = 'INVESTIGATING';
    claim.investigationStartedAt = new Date().toISOString();
    claim.assignedTo = investigator;

    this.addNote(claimId, {
      author: investigator,
      authorRole: 'ADMIN',
      note: 'Investigation démarrée',
      isPublic: true,
    });

    return true;
  }

  // Ajouter une note d'investigation
  addNote(claimId: string, note: Omit<InvestigationNote, 'id' | 'createdAt'>): boolean {
    const claim = this.claims.get(claimId);
    if (!claim) return false;

    const investigationNote: InvestigationNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    claim.investigationNotes.push(investigationNote);
    return true;
  }

  // Résoudre une réclamation
  resolveClaim(params: {
    claimId: string;
    resolution: Omit<ClaimResolution, 'resolvedAt'>;
  }): boolean {
    const claim = this.claims.get(params.claimId);
    if (!claim) return false;

    claim.status = params.resolution.type === 'REJECTED' ? 'REJECTED' : 
                   params.resolution.type === 'REFUNDED' ? 'REFUNDED' : 'RESOLVED';
    claim.resolvedAt = new Date().toISOString();
    claim.resolution = {
      ...params.resolution,
      resolvedAt: new Date().toISOString(),
    };

    this.addNote(params.claimId, {
      author: params.resolution.resolvedBy,
      authorRole: 'ADMIN',
      note: `Réclamation résolue: ${params.resolution.description}`,
      isPublic: true,
    });

    return true;
  }

  // Obtenir une réclamation
  getClaim(claimId: string): Claim | null {
    return this.claims.get(claimId) || null;
  }

  // Obtenir toutes les réclamations
  getAllClaims(): Claim[] {
    return Array.from(this.claims.values());
  }

  // Obtenir les réclamations d'un utilisateur
  getUserClaims(userId: string): Claim[] {
    return Array.from(this.claims.values()).filter(c => c.userId === userId);
  }

  // Obtenir les réclamations par statut
  getClaimsByStatus(status: ClaimStatus): Claim[] {
    return Array.from(this.claims.values()).filter(c => c.status === status);
  }

  // Obtenir les statistiques
  getStatistics(): ClaimStatistics {
    const allClaims = this.getAllClaims();
    
    const byStatus: Record<ClaimStatus, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      INVESTIGATING: 0,
      RESOLVED: 0,
      REJECTED: 0,
      REFUNDED: 0,
    };

    const byType: Record<ClaimType, number> = {
      TICKET_NOT_REVEALED: 0,
      TICKET_INVALID: 0,
      WRONG_PRIZE_AMOUNT: 0,
      PAYMENT_NOT_RECEIVED: 0,
      WITHDRAWAL_NOT_PROCESSED: 0,
      OTHER: 0,
    };

    const byPriority: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;
    let refundCount = 0;

    for (const claim of allClaims) {
      byStatus[claim.status]++;
      byType[claim.type]++;
      byPriority[claim.priority]++;

      if (claim.resolvedAt && claim.submittedAt) {
        const resolutionTime = (new Date(claim.resolvedAt).getTime() - new Date(claim.submittedAt).getTime()) / (1000 * 60 * 60);
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }

      if (claim.status === 'REFUNDED') {
        refundCount++;
      }
    }

    return {
      totalClaims: allClaims.length,
      byStatus,
      byType,
      byPriority,
      averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
      refundRate: allClaims.length > 0 ? (refundCount / allClaims.length) * 100 : 0,
    };
  }
}

const claimManager = new ClaimManager();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Soumettre une réclamation
 */
export function submitClaim(params: {
  userId: string;
  userName: string;
  type: ClaimType;
  ticketId: string | null;
  ticketPublicId: string | null;
  description: string;
  evidence: Omit<ClaimEvidence, 'id' | 'uploadedAt'>[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}): Claim {
  return claimManager.submitClaim(params);
}

/**
 * Acquitter une réclamation
 */
export function acknowledgeClaim(claimId: string, acknowledgedBy: string): boolean {
  return claimManager.acknowledgeClaim(claimId, acknowledgedBy);
}

/**
 * Démarrer l'investigation
 */
export function startInvestigation(claimId: string, investigator: string): boolean {
  return claimManager.startInvestigation(claimId, investigator);
}

/**
 * Ajouter une note d'investigation
 */
export function addInvestigationNote(claimId: string, note: Omit<InvestigationNote, 'id' | 'createdAt'>): boolean {
  return claimManager.addNote(claimId, note);
}

/**
 * Résoudre une réclamation
 */
export function resolveClaim(params: {
  claimId: string;
  resolution: Omit<ClaimResolution, 'resolvedAt'>;
}): boolean {
  return claimManager.resolveClaim(params);
}

/**
 * Obtenir une réclamation
 */
export function getClaim(claimId: string): Claim | null {
  return claimManager.getClaim(claimId);
}

/**
 * Obtenir toutes les réclamations
 */
export function getAllClaims(): Claim[] {
  return claimManager.getAllClaims();
}

/**
 * Obtenir les réclamations d'un utilisateur
 */
export function getUserClaims(userId: string): Claim[] {
  return claimManager.getUserClaims(userId);
}

/**
 * Obtenir les réclamations par statut
 */
export function getClaimsByStatus(status: ClaimStatus): Claim[] {
  return claimManager.getClaimsByStatus(status);
}

/**
 * Obtenir les statistiques
 */
export function getClaimStatistics(): ClaimStatistics {
  return claimManager.getStatistics();
}
