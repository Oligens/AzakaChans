# AZAKA CHANS - Rasin nou. Chans nou.

## 🎯 Vue d'Ensemble

**AZAKA CHANS** est la loterie haïtienne nouvelle génération. Une plateforme numérique et physique conçue pour le marché haïtien, avec un moteur économique robuste, sécurisé et auditable. Le système gère la vente de tickets, la révélation des gains, les paiements mobiles (MonCash/NatCash) et garantit la solvabilité financière grâce à des contrôles stricts.

**Notre mission** : Allier héritage culturel haïtien et innovation technologique pour offrir une expérience de loterie transparente, sécurisée et responsable.

## ✨ Fonctionnalités Principales

### Pour les Utilisateurs
- 🎫 **Achat de tickets** physiques (via distributeurs) et virtuels (via l'app)
- 📱 **Scan QR code** pour révéler les gains des tickets physiques
- 💰 **Portefeuille intégré** avec solde en temps réel
- 🏦 **Retraits** vers MonCash et NatCash
- 📊 **Historique** complet des tickets et transactions

### Pour les Administrateurs
- 🎯 **Gestion des séries** de tickets avec quotas configurables
- 💵 **Moteur financier** avec contrôles de solvabilité automatiques
- 📋 **Registre comptable** en double écriture
- 🔄 **Renouvellement horaire** automatique des séries
- 🚨 **États opérationnels** (NORMAL → SALES_SUSPENDED)
- 📝 **Gestion des réclamations** utilisateurs
- 📈 **Tableaux de bord** direction financière

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend** : React 18 + Vite + Tailwind CSS
- **Moteur** : TypeScript (services modulaires)
- **Base de données** : PostgreSQL (schéma ACID)
- **Paiements** : MonCash (Digicel) + NatCash (NATCOM)

### Modules du Moteur

```
src/engine/
├── financialEngine.ts      # Calculs financiers, couverture, validation
├── ticketGenerator.ts      # Génération sécurisée (Fisher-Yates)
├── hourlyScheduler.ts      # Renouvellement horaire idempotent
├── ledgerService.ts        # Registre comptable double écriture
├── paymentService.ts       # Intégrations MonCash/NatCash
├── platformStateService.ts # États opérationnels
├── claimService.ts         # Gestion des réclamations
└── tests.ts                # Tests automatisés (40+ scénarios)
```

## 🎮 Catégories de Tickets

| Catégorie | Prix | Taux Gagnants | Taux Perdants |
|-----------|------|---------------|---------------|
| A         | 100 HTG | 30% | 70% |
| B         | 250 HTG | 40% | 60% |
| C         | 500 HTG | 50% | 50% |
| D         | 1000 HTG | 60% | 40% |

**Grille de lots** : 50, 100, 250, 500, 1 000, 5 000, 10 000, 25 000, 50 000, 100 000 HTG

## 🔒 Sécurité et Intégrité

### Principes Absolus
1. ✅ **Aucun gain validé ne peut être annulé** pour rétablir la marge
2. ✅ **Aucun résultat de ticket vendu ne peut être modifié**
3. ✅ **Aucune série publiée sans budget vérifié**
4. ✅ **Aucune transaction ne peut créditer/debiter deux fois**
5. ✅ **Aucun retrait ne peut être payé deux fois**

### Mesures Anti-Fraude
- 🔐 Protection brute-force (max 5 tentatives/15min)
- 🕵️ Détection comptes multiples (fingerprint device)
- 💳 Limites de retrait journalier configurables
- ✅ Vérification KYC pour retraits > seuil
- 🔑 Clés d'idempotence sur achats et retraits
- 📜 Audit trail immuable

### Sécurité des Tickets
- Codes secrets : hash SHA-256 côté serveur
- QR codes signés HMAC-SHA256
- Résultats pré-générés et verrouillés avant vente
- Graine aléatoire cryptographique (preuve d'immutabilité)
- **Aucune logique de gain côté client**

## 📊 États Opérationnels

```
NORMAL → WARNING → SALES_RESTRICTED → SALES_SUSPENDED
  ↓                                         ↓
  └────────── RECONCILIATION_REQUIRED ──────┘
```

- **NORMAL** : Toutes opérations autorisées
- **WARNING** : Couverture < 150% (alerte direction)
- **SALES_RESTRICTED** : Seulement catégories 100/250 HTG
- **SALES_SUSPENDED** : Aucune vente, révélations toujours possibles
- **RECONCILIATION_REQUIRED** : Investigation comptable en cours

## 💰 Modèle Financier

### Calculs Automatiques
```
recettes_net = encaissements - remboursements - frais - commissions
resultat_estime = recettes_net - coûts - taxes - lots
couverture = fonds_affectés / engagements_restants
```

### Seuils de Sécurité
- **Couverture minimum** : 120%
- **Seuil d'alerte** : 150%
- **Plafond gain** : 100 000 HTG
- **Plancher gain** : 50 HTG

## 🚀 Démarrage Rapide

### Installation
```bash
# Cloner le dépôt
git clone <repository-url>
cd azaka-chans

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

### Accès à l'Application
- **URL** : http://localhost:5173 (dev) ou dist/index.html (prod)
- **Mode Utilisateur** : Dashboard, boutique, scan, portefeuille
- **Mode Admin** : Supervision complète (par défaut au démarrage)
- **Mode Architecture** : Documentation technique

### Exécution des Tests
1. Ouvrir l'application en mode Admin
2. Naviguer vers "Tests Automatisés"
3. Cliquer sur "Exécuter les tests"
4. Consulter les résultats (40+ scénarios)

## 📁 Structure du Projet

```
azaka-chans/
├── src/
│   ├── App.tsx                 # Interface principale
│   ├── types.ts                # Types de base
│   ├── data.ts                 # Données mockées
│   ├── engine/                 # Moteur de loterie
│   │   ├── financialEngine.ts
│   │   ├── ticketGenerator.ts
│   │   ├── hourlyScheduler.ts
│   │   ├── ledgerService.ts
│   │   ├── paymentService.ts
│   │   ├── platformStateService.ts
│   │   ├── claimService.ts
│   │   └── tests.ts
│   └── index.css               # Styles Tailwind
├── DOCUMENTATION.md            # Documentation d'exploitation
├── package.json
├── vite.config.js
└── tsconfig.json
```

## 🧪 Tests Automatisés

### Couverture (40+ scénarios)
- ✅ Quotas de gagnants/perdants
- ✅ Arrondis pour petites séries
- ✅ Plafond 100 000 HTG
- ✅ Validation budget série
- ✅ Refus série sous-financée
- ✅ Couverture financière
- ✅ Double révélation impossible
- ✅ Double retrait impossible
- ✅ Registre comptable intègre
- ✅ Réconciliation divergences
- ✅ États opérationnels
- ✅ Restrictions par état
- ✅ Réclamations utilisateurs
- ✅ Concurrence (double achat, double révélation)
- ✅ Timeout prestataire
- ✅ Panne et reprise
- ✅ Immutabilité résultats vendus

## ⚠️ Avant Lancement en Production

### Vérifications Obligatoires

1. **Conformité Légale Haïtienne**
   - Autorisation Ministère de l'Économie et des Finances
   - Restrictions d'âge (18+)
   - Obligations de conformité jeux d'argent
   - Protection des consommateurs

2. **Intégrations Prestataires**
   - Comptes marchands MonCash (Digicel)
   - Comptes marchands NatCash (NATCOM)
   - Tests en environnement sandbox
   - Conditions contractuelles

3. **Audit de Sécurité**
   - Audit indépendant du générateur de tickets
   - Test de pénétration API
   - Vérification mécanismes cryptographiques
   - Validation immutabilité des résultats

4. **Capacité Financière**
   - Fonds pour honorer tous les gains potentiels
   - Réserve de liquidité pour retraits
   - Assurance responsabilité civile
   - Plan de trésorerie

5. **Infrastructure**
   - PostgreSQL avec réplication
   - Backups automatiques (RPO < 1h)
   - Monitoring 24/7
   - Plan de reprise d'activité (RTO < 4h)

## 📖 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** : Documentation d'exploitation complète
  - Architecture technique
  - Règles métier
  - Procédures d'exploitation
  - Gestion des incidents
  - Variables de configuration
  - Tests et surveillance

## 🔧 Variables de Configuration

Voir [DOCUMENTATION.md](./DOCUMENTATION.md#variables-de-configuration) pour la liste complète.

Principales :
```env
DATABASE_URL=postgresql://...
MONCASH_API_KEY=<from_vault>
NATCASH_API_KEY=<from_vault>
MIN_COVERAGE_RATIO=1.2
ALERT_COVERAGE_RATIO=1.5
MAX_DAILY_WITHDRAWAL=50000
```

## 🤝 Contribution

Ce projet est conçu pour être auditable, vérifiable et financièrement contrôlé. Toute modification doit :
- Maintenir l'intégrité des résultats
- Préserver la solvabilité financière
- Respecter les principes de sécurité
- Être couverte par des tests

## 📄 Licence

Propriétaire - AZAKA CHANS

## 📞 Contact

- **Direction Technique** : architecture@azakachans.ht
- **Direction Financière** : cfo@azakachans.ht
- **Support** : support@azakachans.ht

---

**Version** : 2.0  
**Statut** : ✅ Build réussi, tests implémentés, documentation complète  
**Prochaine étape** : Audit de sécurité indépendant et vérifications légales
