# AZAKA CHANS - Documentation d'Exploitation

## Architecture Technique

### Composants Principaux

1. **Frontend** (React/Vite/Tailwind)
   - Dashboard utilisateur (achat, révélation, portefeuille)
   - Dashboard administrateur (supervision, validation, rapports)
   - Dashboard direction financière (solvabilité, réserves)

2. **Moteur de Loterie** (`src/engine/`)
   - `financialEngine.ts` : Calculs financiers, couverture, validation budget
   - `ticketGenerator.ts` : Génération sécurisée de tickets (Fisher-Yates)
   - `hourlyScheduler.ts` : Renouvellement horaire idempotent
   - `ledgerService.ts` : Registre comptable en double écriture
   - `paymentService.ts` : Intégrations MonCash/NatCash
   - `platformStateService.ts` : États opérationnels (NORMAL → SALES_SUSPENDED)
   - `claimService.ts` : Gestion des réclamations

3. **Base de Données** (PostgreSQL - schéma documenté)
   - Tables : users, wallets, series, tickets, transactions, withdrawals, hourly_cycles, financial_alerts
   - Contraintes ACID strictes
   - Index optimisés

### Règles Métier Critiques

#### Catégories de Tickets
| Catégorie | Prix | Taux Gagnants | Taux Perdants |
|-----------|------|---------------|---------------|
| A         | 100 HTG | 30% | 70% |
| B         | 250 HTG | 40% | 60% |
| C         | 500 HTG | 50% | 50% |
| D         | 1000 HTG | 60% | 40% |

#### Grille de Lots
50 HTG, 100 HTG, 250 HTG, 500 HTG, 1 000 HTG, 5 000 HTG, 10 000 HTG, 25 000 HTG, 50 000 HTG, 100 000 HTG

#### Machine à États des Tickets
```
CREATED → SOLD → REVEALED → REDEEMED
```
- Aucune transition arrière
- Aucun résultat modifiable après SOLD
- Double révélation impossible (SELECT FOR UPDATE)

#### Machine à États des Retraits
```
REQUESTED → VALIDATED → PROCESSING → PAID
                ↓           ↓
            REJECTED    FAILED → RECONCILED
```
- Confirmation prestataire obligatoire avant PAID
- Idempotence via clés uniques
- Vérification d'état réel avant retry

#### États Opérationnels de la Plateforme
```
NORMAL → WARNING → SALES_RESTRICTED → SALES_SUSPENDED
  ↓                                         ↓
  └────────── RECONCILIATION_REQUIRED ──────┘
```
- **NORMAL** : Toutes opérations autorisées
- **WARNING** : Couverture < seuil d'alerte (150%)
- **SALES_RESTRICTED** : Seulement catégories 100/250 HTG
- **SALES_SUSPENDED** : Aucune vente, révélations toujours possibles
- **RECONCILIATION_REQUIRED** : Investigation comptable en cours

### Calculs Financiers

#### Recettes Nettes
```
net_revenue = encaissements_confirmés - remboursements - frais_variables - commissions
```

#### Résultat Estimé
```
estimated_profit = net_revenue - coûts_opérationnels - taxes_à_provisionner - coût_des_lots
```

#### Couverture Financière
```
couverture_gains = fonds_affectés_aux_gains / engagements_restants
```
- Seuil minimum : 120%
- Seuil d'alerte : 150%
- Dénominateur nul traité explicitement (pas de division par zéro)

### Sécurité et Intégrité

#### Principes Absolus
1. **Aucun gain validé ne peut être annulé** pour rétablir la marge
2. **Aucun résultat de ticket vendu ne peut être modifié**
3. **Aucune série publiée sans budget vérifié**
4. **Aucune transaction ne peut créditer/debiter deux fois**
5. **Aucun retrait ne peut être payé deux fois**

#### Mesures Anti-Fraude
- Protection brute-force (max 5 tentatives/15min)
- Détection comptes multiples (fingerprint device)
- Limites de retrait journalier configurables
- Vérification KYC pour retraits > seuil
- Clés d'idempotence sur achats et retraits
- Audit trail immuable

#### Sécurité des Tickets
- Codes secrets : hash SHA-256 côté serveur
- QR codes signés HMAC-SHA256
- Résultats pré-générés et verrouillés avant vente
- Graine aléatoire cryptographique (preuve d'immutabilité)
- Aucune logique de gain côté client

### Procédures d'Exploitation

#### Publication d'une Nouvelle Série

1. **Préparation**
   - Définir catégorie, prix, nombre de tickets
   - Configurer la grille de lots
   - Calculer le coût maximal des lots

2. **Validation Financière**
   - Vérifier budget approuvé ≥ coût maximal
   - Vérifier couverture actuelle ≥ seuil minimum
   - Vérifier liquidité disponible ≥ réserve requise

3. **Génération des Résultats**
   - Utiliser générateur cryptographiquement sûr
   - Distribuer gagnants/perdants selon quotas
   - Calculer hash de la graine (preuve)

4. **Publication**
   - Verrouiller la configuration
   - Enregistrer dans le registre d'audit
   - Rendre disponible à la vente

#### Renouvellement Horaire

1. **Acquisition du verrou** (idempotence)
2. **Calcul des recettes** confirmées
3. **Mise à jour des engagements** (gains validés, retraits)
4. **Vérification des séries** précédentes
5. **Contrôle de solvabilité** (ratio de couverture)
6. **Publication** (si conditions satisfaites)
7. **Journalisation** (paramètres, version, contrôles)

#### Gestion des Incidents

##### Panne pendant publication
- Les tickets déjà publiés restent intacts
- Reprise à partir du point d'arrêt
- Pas de duplication de séries

##### Timeout prestataire paiement
- Vérifier état réel auprès du prestataire
- Ne pas marquer comme payé sans confirmation
- Retry avec clé d'idempotence
- Rapprochement manuel si nécessaire

##### Divergence comptable
- Détection automatique (registre vs externe)
- Passage en mode RECONCILIATION_REQUIRED
- Investigation et écritures compensatoires
- Reprise manuelle après validation

##### Insuffisance de couverture
- Transition automatique vers SALES_RESTRICTED ou SALES_SUSPENDED
- Alertes direction financière
- Conservation des droits utilisateurs (révélations possibles)
- Reprise après renflouement des réserves

### Variables de Configuration

```env
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/azakachans
DATABASE_POOL_SIZE=20

# Sécurité
JWT_SECRET=<generated>
ENCRYPTION_KEY=<generated>
API_RATE_LIMIT=100

# Prestataires
MONCASH_API_URL=https://api.moncash.com/v1
MONCASH_API_KEY=<from_vault>
MONCASH_TIMEOUT=30000

NATCASH_API_URL=https://api.natcash.ht/v1
NATCASH_API_KEY=<from_vault>
NATCASH_TIMEOUT=30000

# Seuils financiers
MIN_COVERAGE_RATIO=1.2
ALERT_COVERAGE_RATIO=1.5
MAX_DAILY_WITHDRAWAL=50000
KYC_THRESHOLD=10000

# Renouvellement
HOURLY_CYCLE_ENABLED=true
MAX_SERIES_PER_DAY=24
```

### Surveillance et Alertes

#### Métriques à Surveiller
- Ratio de couverture (seuil : 120%)
- Nombre d'anomalies non résolues
- Échecs de paiement prestataires
- Divergences comptables
- Temps de résolution des réclamations

#### Alertes Automatiques
- **CRITICAL** : Couverture < 120% → SALES_SUSPENDED
- **WARNING** : Couverture < 150% → alerte direction
- **INFO** : Nouvelle série publiée, réclamation soumise

### Procédures de Reprise Après Incident

#### Restauration de Base de Données
1. Arrêter les services applicatifs
2. Restaurer le dernier backup valide
3. Vérifier l'intégrité du registre comptable
4. Reconcilier avec les prestataires externes
5. Redémarrer les services
6. Vérifier l'état de la plateforme

#### Reprise Après Panne
1. Vérifier l'état des séries en cours
2. Identifier les tickets partiellement publiés
3. Compléter ou annuler les publications incomplètes
4. Vérifier les retraits en cours (PROCESSING)
5. Reprendre le cycle horaire à partir du dernier cycle réussi

### Tests Automatisés

#### Couverture des Tests
- ✅ Quotas de gagnants/perdants
- ✅ Arrondis pour petites séries
- ✅ Plafond 100 000 HTG
- ✅ Validation budget série
- ✅ Refus série sous-financée
- ✅ Couverture financière (dénominateur nul)
- ✅ Double révélation impossible
- ✅ Double retrait impossible (idempotence)
- ✅ Registre comptable intègre
- ✅ Réconciliation divergences
- ✅ États opérationnels
- ✅ Restrictions par état
- ✅ Réclamations utilisateurs
- ✅ Concurrence (double achat, double révélation)
- ✅ Timeout prestataire
- ✅ Panne et reprise
- ✅ Immutabilité résultats vendus

#### Exécution des Tests
```bash
# Dans l'interface admin
Page "Tests Automatisés" → "Exécuter les tests"

# En ligne de commande (à implémenter)
npm run test:engine
```

### Limitations et Vérifications Nécessaires

#### Avant Lancement en Production

1. **Conformité Légale Haïtienne**
   - Vérifier autorisation Ministère de l'Économie et des Finances
   - Restrictions d'âge (18+)
   - Obligations de conformité jeux d'argent
   - Protection des consommateurs

2. **Intégrations Prestataires**
   - Obtenir comptes marchands MonCash (Digicel)
   - Obtenir comptes marchands NatCash (NATCOM)
   - Tester en environnement sandbox
   - Vérifier conditions contractuelles

3. **Audit de Sécurité**
   - Audit indépendant du générateur de tickets
   - Test de pénétration API
   - Vérification des mécanismes cryptographiques
   - Validation de l'immutabilité des résultats

4. **Capacité Financière**
   - Disposer des fonds pour honorer tous les gains potentiels
   - Réserve de liquidité pour retraits
   - Assurance responsabilité civile
   - Plan de trésorerie

5. **Infrastructure**
   - Base de données PostgreSQL avec réplication
   - Backups automatiques (RPO < 1h)
   - Monitoring 24/7
   - Plan de reprise d'activité (RTO < 4h)

### Contact et Support

- **Direction Technique** : architecture@azakachans.ht
- **Direction Financière** : cfo@azakachans.ht
- **Support Utilisateurs** : support@azakachans.ht
- **Conformité Légale** : legal@azakachans.ht

---

**Version** : 2.0  
**Dernière mise à jour** : 2024-04-10  
**Statut** : Prêt pour audit de sécurité et vérifications légales
