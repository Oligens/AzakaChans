/**
 * AUDIT LOGGING SERVICE - AZAKA CHANS
 * 
 * Service de journalisation des actions sensibles pour la sécurité et la conformité.
 * 
 * FONCTIONNALITÉS:
 * - Journalisation des connexions et authentifications
 * - Journalisation des opérations financières
 * - Journalisation des modifications de configuration
 * - Journalisation des accès administratifs
 * - Protection contre la falsification des logs
 * - Export et analyse des logs
 */

// ============================================================
// TYPES
// ============================================================

export type AuditLogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type AuditAction = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'PASSWORD_CHANGED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'USER_CREATED'
  | 'USER_MODIFIED'
  | 'USER_DELETED'
  | 'ROLE_CHANGED'
  | 'TICKET_PURCHASED'
  | 'TICKET_REVEALED'
  | 'TICKET_REDEEMED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'WITHDRAWAL_COMPLETED'
  | 'WITHDRAWAL_FAILED'
  | 'JACKPOT_ACTIVATED'
  | 'JACKPOT_WON'
  | 'JACKPOT_PAID'
  | 'SERIES_CREATED'
  | 'SERIES_PUBLISHED'
  | 'SERIES_SUSPENDED'
  | 'SERIES_CLOSED'
  | 'CONFIG_CHANGED'
  | 'RESERVE_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'API_ACCESS'
  | 'ADMIN_ACTION'
  | 'SECURITY_ALERT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: AuditLogLevel;
  action: AuditAction;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string;
  userAgent: string;
  resource: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  previousHash?: string; // Pour la chaîne de hachage
  hash: string; // Hash de l'entrée pour l'intégrité
}

export interface AuditLogQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: AuditAction;
  level?: AuditLogLevel;
  success?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================
// STOCKAGE DES LOGS
// ============================================================

class AuditLogStore {
  private logs: AuditLogEntry[] = [];
  private lastHash: string = '';

  /**
   * Ajoute une entrée au journal (version synchrone simplifiée)
   */
  add(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hash' | 'previousHash'>): AuditLogEntry {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const previousHash = this.lastHash;

    // Créer l'entrée sans le hash
    const entryWithoutHash = {
      id,
      timestamp,
      previousHash,
      ...entry,
    };

    // Calculer le hash de l'entrée (version synchrone simplifiée)
    const hash = this.calculateHashSync(entryWithoutHash);

    const completeEntry: AuditLogEntry = {
      ...entryWithoutHash,
      hash,
    };

    this.logs.push(completeEntry);
    this.lastHash = hash;

    return completeEntry;
  }

  /**
   * Version synchrone du calcul de hash (pour compatibilité)
   */
  private calculateHashSync(entry: any): string {
    // Utiliser un hash simple mais déterministe
    const str = JSON.stringify(entry);
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Calcule le hash d'une entrée pour garantir l'intégrité
   */
  private async calculateHash(entry: any): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(entry));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Récupère les logs avec filtrage
   */
  query(filters: AuditLogQuery): AuditLogEntry[] {
    let results = [...this.logs];

    if (filters.startDate) {
      results = results.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      results = results.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters.userId) {
      results = results.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      results = results.filter(log => log.action === filters.action);
    }

    if (filters.level) {
      results = results.filter(log => log.level === filters.level);
    }

    if (filters.success !== undefined) {
      results = results.filter(log => log.success === filters.success);
    }

    // Trier par timestamp décroissant
    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    // Appliquer pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    return results.slice(offset, offset + limit);
  }

  /**
   * Vérifie l'intégrité de la chaîne de logs
   */
  verifyIntegrity(): { valid: boolean; brokenAt?: number } {
    let previousHash = '';

    for (let i = 0; i < this.logs.length; i++) {
      const log = this.logs[i];

      if (log.previousHash !== previousHash) {
        return { valid: false, brokenAt: i };
      }

      // Recalculer le hash
      const { hash, ...entryWithoutHash } = log;
      const calculatedHash = this.calculateHashSync(entryWithoutHash);

      if (calculatedHash !== hash) {
        return { valid: false, brokenAt: i };
      }

      previousHash = hash;
    }

    return { valid: true };
  }

  /**
   * Exporte tous les logs
   */
  export(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Compte les logs par action
   */
  countByAction(): Record<AuditAction, number> {
    const counts: Record<string, number> = {};
    
    for (const log of this.logs) {
      counts[log.action] = (counts[log.action] || 0) + 1;
    }
    
    return counts as Record<AuditAction, number>;
  }

  /**
   * Compte les logs par niveau
   */
  countByLevel(): Record<AuditLogLevel, number> {
    const counts: Record<string, number> = {
      INFO: 0,
      WARNING: 0,
      ERROR: 0,
      CRITICAL: 0,
    };
    
    for (const log of this.logs) {
      counts[log.level]++;
    }
    
    return counts as Record<AuditLogLevel, number>;
  }
}

// Instance globale
const auditLogStore = new AuditLogStore();

// ============================================================
// FONCTIONS PUBLIQUES
// ============================================================

/**
 * Journalise une action d'authentification
 */
export function logAuthentication(
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED',
  params: {
    userId?: string;
    userEmail?: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    errorMessage?: string;
  }
): AuditLogEntry {
  return auditLogStore.add({
    level: action === 'LOGIN_FAILED' ? 'WARNING' : 'INFO',
    action,
    userId: params.userId || null,
    userEmail: params.userEmail || null,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    resource: '/auth',
    details: {},
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Journalise une opération financière
 */
export function logFinancialOperation(
  action: 'TICKET_PURCHASED' | 'TICKET_REVEALED' | 'WITHDRAWAL_REQUESTED' | 'WITHDRAWAL_COMPLETED',
  params: {
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    amount?: number;
    ticketId?: string;
    withdrawalId?: string;
    success: boolean;
    errorMessage?: string;
  }
): AuditLogEntry {
  return auditLogStore.add({
    level: params.success ? 'INFO' : 'ERROR',
    action,
    userId: params.userId,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    resource: '/financial',
    details: {
      amount: params.amount,
      ticketId: params.ticketId,
      withdrawalId: params.withdrawalId,
    },
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Journalise une action administrative
 */
export function logAdminAction(
  action: AuditAction,
  params: {
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    resource: string;
    details?: Record<string, any>;
    success: boolean;
    errorMessage?: string;
    level?: AuditLogLevel;
  }
): AuditLogEntry {
  return auditLogStore.add({
    level: params.level || (params.success ? 'INFO' : 'ERROR'),
    action,
    userId: params.userId,
    userEmail: params.userEmail,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    resource: params.resource,
    details: params.details || {},
    success: params.success,
    errorMessage: params.errorMessage,
  });
}

/**
 * Journalise une alerte de sécurité
 */
export function logSecurityAlert(
  action: 'SECURITY_ALERT' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY',
  params: {
    userId?: string;
    ipAddress: string;
    userAgent: string;
    reason: string;
    details?: Record<string, any>;
  }
): AuditLogEntry {
  return auditLogStore.add({
    level: 'CRITICAL',
    action,
    userId: params.userId || null,
    userEmail: null,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    resource: '/security',
    details: {
      reason: params.reason,
      ...params.details,
    },
    success: false,
  });
}

/**
 * Récupère les logs avec filtrage
 */
export function queryAuditLogs(filters: AuditLogQuery): AuditLogEntry[] {
  return auditLogStore.query(filters);
}

/**
 * Vérifie l'intégrité des logs
 */
export function verifyAuditLogIntegrity(): { valid: boolean; brokenAt?: number } {
  return auditLogStore.verifyIntegrity();
}

/**
 * Exporte tous les logs
 */
export function exportAuditLogs(): AuditLogEntry[] {
  return auditLogStore.export();
}

/**
 * Obtient les statistiques des logs
 */
export function getAuditLogStats(): {
  byAction: Record<AuditAction, number>;
  byLevel: Record<AuditLogLevel, number>;
  total: number;
} {
  return {
    byAction: auditLogStore.countByAction(),
    byLevel: auditLogStore.countByLevel(),
    total: auditLogStore.export().length,
  };
}

/**
 * Détecte les activités suspectes
 */
export function detectSuspiciousActivity(): Array<{
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  count: number;
}> {
  const alerts: Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
    count: number;
  }> = [];

  const recentLogs = auditLogStore.query({ limit: 1000 });
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  // Détecter les échecs de connexion multiples
  const failedLogins = recentLogs.filter(
    log => log.action === 'LOGIN_FAILED' && log.timestamp > oneHourAgo
  );

  if (failedLogins.length > 10) {
    alerts.push({
      type: 'MULTIPLE_LOGIN_FAILURES',
      severity: 'HIGH',
      description: `${failedLogins.length} échecs de connexion dans la dernière heure`,
      count: failedLogins.length,
    });
  }

  // Détecter les activités hors heures normales
  const offHourActivity = recentLogs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour < 6 || hour > 22;
  });

  if (offHourActivity.length > 20) {
    alerts.push({
      type: 'OFF_HOURS_ACTIVITY',
      severity: 'MEDIUM',
      description: `${offHourActivity.length} activités en dehors des heures normales`,
      count: offHourActivity.length,
    });
  }

  // Détecter les accès admin multiples
  const adminAccess = recentLogs.filter(
    log => log.action === 'ADMIN_ACTION' && log.timestamp > oneHourAgo
  );

  if (adminAccess.length > 50) {
    alerts.push({
      type: 'EXCESSIVE_ADMIN_ACCESS',
      severity: 'MEDIUM',
      description: `${adminAccess.length} actions administratives dans la dernière heure`,
      count: adminAccess.length,
    });
  }

  return alerts;
}
