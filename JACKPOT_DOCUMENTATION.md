# Moteur de Jackpot Itinérant - Documentation Technique

## Vue d'Ensemble

Le moteur de jackpot itinérant est un système de loterie à jackpot fixe de **100 000 HTG** qui alterne entre quatre catégories de tickets selon un cycle prédéfini.

## Architecture

### Composants Principaux

1. **jackpotEngine.ts** - Service principal du moteur
2. **Types TypeScript** - Définitions strictes des états et transitions
3. **Tests automatisés** - Validation des règles métier
4. **Interface Admin** - Page de gestion du jackpot

### Fichiers Modifiés/Créés

```
src/engine/
├── jackpotEngine.ts          # NOUVEAU - Moteur de jackpot
├── index.ts                  # MODIFIÉ - Export du nouveau service
└── tests.ts                  # MODIFIÉ - Tests du jackpot ajoutés

src/
└── App.tsx                   # MODIFIÉ - Page AdminJackpot ajoutée
```

## Règles Métier Implémentées

### 1. Montant Fixe du Jackpot
- **Montant unique** : 100 000 HTG
- **Non négociable** : Ne peut être modifié
- **Financement intégral** : Requis avant chaque activation

### 2. Cycle des Catégories

```
50 HTG → 250 HTG → 500 HTG → 1 000 HTG → 50 HTG (boucle)
```

**Implémentation** :
```typescript
const CATEGORIES: JackpotCategory[] = [50, 250, 500, 1000];
// Index circulaire avec modulo
this.categoryIndex = (this.categoryIndex + 1) % CATEGORIES.length;
```

### 3. Machine à États Stricte

#### États Possibles

| État | Description | Conditions |
|------|-------------|------------|
| `RESERVE_INSUFFISANTE` | Réserve < 100 000 HTG | Bloque toute activation |
| `PRET` | Réserve ≥ 100 000 HTG | Prêt à activer |
| `ACTIF_50` | Jackpot actif pour tickets 50 HTG | Après activation |
| `ACTIF_250` | Jackpot actif pour tickets 250 HTG | Après activation |
| `ACTIF_500` | Jackpot actif pour tickets 500 HTG | Après activation |
| `ACTIF_1000` | Jackpot actif pour tickets 1 000 HTG | Après activation |
| `VICTOIRE_EN_COURS` | Victoire enregistrée, paiement en attente | Transition automatique |
| `PAIEMENT_EN_ATTENTE` | Paiement initié auprès du prestataire | En cours de traitement |
| `PAIEMENT_ECHOUE` | Échec du paiement | Nécessite réconciliation |

#### Transitions Autorisées

```
RESERVE_INSUFFISANTE → PRET (si réserve ≥ 100 000)
PRET → ACTIF_{category} (activation manuelle)
ACTIF_{category} → VICTOIRE_EN_COURS (victoire enregistrée)
VICTOIRE_EN_COURS → PAIEMENT_EN_ATTENTE (paiement initié)
PAIEMENT_EN_ATTENTE → RESERVE_INSUFFISANTE (paiement confirmé + passage catégorie suivante)
PAIEMENT_EN_ATTENTE → PAIEMENT_ECHOUE (échec paiement)
```

### 4. Financement et Réserve

#### Règles de Financement

```typescript
// Vérification avant activation
if (this.state.reserveBalance < JACKPOT_AMOUNT) {
  return { success: false, error: 'Réserve insuffisante' };
}

// Déduction après victoire
this.state.reserveBalance -= JACKPOT_AMOUNT;
```

#### Obligations

- ✅ Financement intégral de 100 000 HTG avant activation
- ✅ Blocage automatique si réserve insuffisante
- ✅ Réapprovisionnement requis après chaque victoire
- ✅ Aucune activation sans financement confirmé

### 5. Immutabilité des Gains

#### Principes Absolus

1. **Aucun gain ne peut être réduit** après attribution
2. **Aucun résultat ne peut être modifié** après vente du ticket
3. **Aucune probabilité ne peut être changée** secrètement
4. **Toute victoire est définitive** et doit être payée

#### Implémentation

```typescript
// Une fois la victoire enregistrée, les données sont immuables
const victory: JackpotVictory = {
  amount: JACKPOT_AMOUNT,  // Fixe à 100 000 HTG
  category: this.state.currentCategory,  // Catégorie au moment de la victoire
  // ... autres champs
};

// Pas de méthode pour modifier une victoire existante
// Seuls les statuts de paiement peuvent évoluer
```

### 6. Idempotence

#### Protection contre les Doubles Victoires

```typescript
// Vérification de la clé d'idempotence
if (this.idempotencyKeys.has(params.idempotencyKey)) {
  return { success: false, error: 'Victoire déjà enregistrée (idempotence)' };
}

// Enregistrement de la clé
this.idempotencyKeys.add(params.idempotencyKey);
```

#### Protection contre les Doubles Paiements

```typescript
// Vérification du statut avant paiement
if (victory.paymentStatus !== 'PENDING') {
  return { success: false, error: `Statut invalide: ${victory.paymentStatus}` };
}
```

### 7. Traçabilité Complète

#### Événements Enregistrés

| Type d'Événement | Description |
|------------------|-------------|
| `ACTIVATED` | Jackpot activé pour une catégorie |
| `VICTORY` | Victoire enregistrée |
| `PAYMENT_INITIATED` | Paiement initié |
| `PAYMENT_COMPLETED` | Paiement confirmé |
| `PAYMENT_FAILED` | Échec du paiement |
| `TRANSITION` | Changement d'état |
| `RESERVE_UPDATED` | Mise à jour de la réserve |

#### Transitions Enregistrées

```typescript
interface JackpotTransition {
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
}
```

## API Publique

### Fonctions Principales

```typescript
// Obtenir l'état actuel
getJackpotState(): JackpotState_

// Obtenir la configuration
getJackpotConfig(): JackpotConfig

// Mettre à jour la réserve
updateJackpotReserve(params: {
  amount: number;
  reason: string;
  updatedBy: string;
}): { success: boolean; error?: string }

// Activer le jackpot
activateJackpot(triggeredBy: string): { success: boolean; error?: string }

// Enregistrer une victoire
recordJackpotVictory(params: {
  ticketId: string;
  ticketPublicId: string;
  userId: string;
  userName: string;
  idempotencyKey: string;
}): { success: boolean; victory?: JackpotVictory; error?: string }

// Initier le paiement
initiateJackpotPayment(params: {
  victoryId: string;
  paymentId: string;
  triggeredBy: string;
}): { success: boolean; error?: string }

// Confirmer le paiement
confirmJackpotPayment(params: {
  victoryId: string;
  providerTransactionId: string;
  confirmedBy: string;
}): { success: boolean; error?: string }

// Échec du paiement
failJackpotPayment(params: {
  victoryId: string;
  reason: string;
  failedBy: string;
}): { success: boolean; error?: string }

// Obtenir l'historique
getJackpotTransitions(): JackpotTransition[]
getJackpotVictories(): JackpotVictory[]
getJackpotEvents(): JackpotEvent[]
```

## Tests Automatisés

### Scénarios Couverts (11 tests)

1. ✅ **Activation avec réserve complète**
   - Réserve = 100 000 HTG
   - Activation réussie
   - État = ACTIF_50

2. ✅ **Blocage si réserve insuffisante**
   - Réserve = 50 000 HTG
   - Activation refusée
   - État = RESERVE_INSUFFISANTE

3. ✅ **Cycle exact 50 → 250 → 500 → 1000 → 50**
   - Simulation de 5 victoires
   - Vérification de l'ordre des catégories

4. ✅ **Blocage catégorie suivante sans financement**
   - Victoire sans réapprovisionnement
   - Tentative d'activation refusée

5. ✅ **Idempotence des victoires**
   - Même clé d'idempotence
   - Deuxième victoire rejetée

6. ✅ **Paiement complet avec confirmation**
   - Victoire → Paiement initié → Paiement confirmé
   - Statut = PAID

7. ✅ **Échec paiement et réconciliation**
   - Victoire → Paiement initié → Échec
   - Statut = FAILED
   - État = PAIEMENT_ECHOUE

8. ✅ **Traçabilité des transitions**
   - Vérification de l'historique
   - Événements enregistrés

9. ✅ **Immutabilité après victoire**
   - Montant et catégorie non modifiables

10. ✅ **Prochaine catégorie correcte**
    - Vérification du cycle

11. ✅ **Intégration avec le registre comptable**
    - Cohérence des écritures

### Exécution des Tests

```bash
# Dans l'interface admin
Page "Tests Automatisés" → "Exécuter les tests"

# Résultats attendus
Total: 51+ tests | Réussis: 51+ | Échoués: 0
```

## Interface Utilisateur

### Page AdminJackpot

**Fonctionnalités** :
- Visualisation de l'état actuel du jackpot
- Affichage du cycle des catégories (50 → 250 → 500 → 1000)
- Gestion de la réserve (mise à jour manuelle)
- Activation du jackpot (avec modal de confirmation)
- Simulation de victoires (pour tests)
- Historique des victoires

**Accès** :
```
Menu Admin → "Jackpot Itinérant"
```

## Intégration avec l'Architecture Existante

### Services Utilisés

1. **ledgerService** - Enregistrement des écritures comptables
2. **paymentService** - Gestion des paiements MonCash/NatCash
3. **financialEngine** - Validation de la couverture financière
4. **platformStateService** - Coordination avec l'état de la plateforme

### Flux d'Intégration

```
1. Mise à jour de la réserve
   ↓
2. Vérification financière (financialEngine)
   ↓
3. Activation du jackpot
   ↓
4. Vente de tickets (ticketGenerator)
   ↓
5. Révélation d'un ticket gagnant
   ↓
6. Enregistrement de la victoire (jackpotEngine)
   ↓
7. Initiation du paiement (paymentService)
   ↓
8. Confirmation du paiement
   ↓
9. Écriture comptable (ledgerService)
   ↓
10. Transition vers catégorie suivante
```

## Sécurité et Conformité

### Mesures de Sécurité

1. **Idempotence** - Clés uniques pour chaque opération
2. **Transactions atomiques** - Pas d'état intermédiaire
3. **Immutabilité** - Gains non modifiables après attribution
4. **Traçabilité** - Historique complet des transitions
5. **Validation stricte** - Vérification des états avant chaque action

### Conformité aux Règles Métier

| Règle | Implémentation | Vérifié |
|-------|----------------|---------|
| Montant fixe 100 000 HTG | Constante `JACKPOT_AMOUNT` | ✅ |
| Cycle 50→250→500→1000→50 | Index circulaire | ✅ |
| Financement intégral requis | Vérification `reserveBalance` | ✅ |
| Blocage si réserve insuffisante | État `RESERVE_INSUFFISANTE` | ✅ |
| Immutabilité des gains | Pas de méthode de modification | ✅ |
| Idempotence des victoires | Clés d'idempotence | ✅ |
| Traçabilité complète | Événements et transitions | ✅ |

## Limitations et Considérations

### Limitations Actuelles

1. **Simulation uniquement** - Pas d'intégration réelle avec MonCash/NatCash
2. **Stockage en mémoire** - Pas de persistance (à implémenter avec PostgreSQL)
3. **Pas de concurrence réelle** - Tests séquentiels (à valider en production)

### Recommandations pour la Production

1. **Persistance** : Implémenter avec PostgreSQL
   - Table `jackpot_state` pour l'état courant
   - Table `jackpot_victories` pour l'historique
   - Table `jackpot_transitions` pour l'audit
   - Table `jackpot_events` pour la traçabilité

2. **Transactions ACID** : Utiliser `SELECT ... FOR UPDATE`
   ```sql
   BEGIN;
   SELECT * FROM jackpot_state FOR UPDATE;
   -- Vérifications et modifications
   COMMIT;
   ```

3. **Verrous distribués** : Pour les environnements multi-instances
   - Redis ou PostgreSQL advisory locks
   - Protection contre les doubles activations

4. **Audit externe** : Faire vérifier par un tiers indépendant
   - Mécanisme de génération des résultats
   - Intégrité des transitions
   - Conformité réglementaire

5. **Conformité légale** : Vérifier les exigences haïtiennes
   - Autorisation Ministère de l'Économie
   - Restrictions d'âge
   - Obligations fiscales

## Prochaines Étapes

1. ✅ **Implémentation du moteur** - Terminée
2. ✅ **Tests automatisés** - Terminés
3. ✅ **Interface admin** - Terminée
4. ⏳ **Persistance PostgreSQL** - À implémenter
5. ⏳ **Intégration MonCash/NatCash** - À implémenter
6. ⏳ **Audit de sécurité** - À planifier
7. ⏳ **Conformité légale** - À vérifier

## Contact

- **Documentation technique** : Voir DOCUMENTATION.md
- **Tests** : Page "Tests Automatisés" dans l'interface admin
- **Support** : support@chansayiti.ht

---

**Version** : 1.0  
**Date** : 2024-04-10  
**Statut** : ✅ Implémenté, testé, documenté
