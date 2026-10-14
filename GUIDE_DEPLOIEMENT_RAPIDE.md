# 🚀 Guide de Déploiement Rapide - AZAKA CHANS

## 📋 Sommaire

1. [Schéma SQL pour Neon PostgreSQL](#1-schéma-sql-pour-neon-postgresql)
2. [Variables d'Environnement pour Vercel](#2-variables-denvironnement-pour-vercel)
3. [Instructions de Déploiement](#3-instructions-de-déploiement)

---

## 1. Schéma SQL pour Neon PostgreSQL

### 📄 Fichier SQL Complet

Le schéma SQL complet se trouve dans : **`database/neon_schema.sql`**

### 📋 Tables Créées (13 tables)

1. **users** - Utilisateurs de la plateforme
2. **email_verifications** - Codes de vérification email
3. **user_profiles** - Profils utilisateurs étendus
4. **wallets** - Portefeuilles utilisateurs
5. **ticket_batches** - Lots de tickets (séries)
6. **tickets** - Tickets individuels
7. **transactions** - Registre comptable en double écriture
8. **deposits** - Dépôts d'argent
9. **withdrawals** - Retraits d'argent
10. **jackpot_state** - État du jackpot itinérant
11. **jackpot_victories** - Victoires au jackpot
12. **audit_logs** - Journal d'audit
13. **sessions** - Sessions utilisateur

### 🔧 Comment Exécuter le Schéma sur Neon

#### Étape 1 : Créer un projet Neon

1. Allez sur [https://neon.tech](https://neon.tech)
2. Connectez-vous ou créez un compte
3. Cliquez sur **"New Project"**
4. Nommez le projet : `azaka-chans`
5. Sélectionnez la région la plus proche (ex: US East)
6. Cliquez sur **"Create Project"**

#### Étape 2 : Copier l'URL de connexion

1. Dans le tableau de bord Neon, allez dans **"Connection Details"**
2. Copiez l'**URL de connexion** (format : `postgresql://user:password@host.neon.tech/dbname`)
3. **Important** : Gardez cette URL sécurisée

#### Étape 3 : Exécuter le schéma SQL

1. Dans Neon, allez dans **"SQL Editor"**
2. Ouvrez le fichier `database/neon_schema.sql` dans votre éditeur
3. Copiez **TOUT** le contenu du fichier
4. Collez-le dans le SQL Editor de Neon
5. Cliquez sur **"Run"** (ou Ctrl+Enter)
6. Attendez que l'exécution se termine (quelques secondes)

#### Étape 4 : Vérifier l'exécution

Exécutez cette requête pour vérifier que toutes les tables sont créées :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir les 13 tables listées ci-dessus.

### ⚠️ Important

- **Ne modifiez PAS** le fichier SQL sauf si vous savez ce que vous faites
- **Ne supprimez PAS** de tables existantes
- Le schéma est conçu pour être **non-destructif** (utilisé `IF NOT EXISTS`)
- Toutes les contraintes, index et triggers sont inclus

---

## 2. Variables d'Environnement pour Vercel

### 📝 Liste Complète des Variables

Copiez ce contenu dans un fichier `.env.local` pour le développement, ou configurez ces variables dans le dashboard Vercel pour la production.

```bash
# ============================================================
# BASE DE DONNÉES - OBLIGATOIRE
# ============================================================

# URL de connexion à Neon PostgreSQL
# Récupérez cette URL depuis le tableau de bord Neon
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# URL de connexion poolée (recommandée pour les fonctions serverless)
# Utilisez cette URL pour de meilleures performances
DATABASE_URL_POOLED=postgresql://user:password@host.neon.tech/dbname?sslmode=require&pgbouncer=true

# ============================================================
# APPLICATION - OBLIGATOIRE
# ============================================================

# URL de votre application (sans slash final)
# En production : https://votre-domaine.vercel.app
# En développement : http://localhost:3000
APP_URL=https://azaka-chans.vercel.app

# Environnement (development, staging, production)
NODE_ENV=production

# ============================================================
# AUTHENTIFICATION - OBLIGATOIRE
# ============================================================

# Secret pour signer les JWT (min 32 caractères)
# Générez avec : openssl rand -base64 32
# OU utilisez un générateur en ligne : https://generate-secret.vercel.app/32
JWT_SECRET=votre-secret-jwt-tres-long-et-securise-min-32-caracteres

# Durée de validité des sessions (en secondes)
# 86400 = 24 heures
SESSION_DURATION=86400

# Durée de validité des codes de vérification email (en secondes)
# 600 = 10 minutes
EMAIL_VERIFICATION_DURATION=600

# Nombre maximum de tentatives de vérification
MAX_VERIFICATION_ATTEMPTS=5

# ============================================================
# ENVOI D'EMAIL - RECOMMANDÉ
# ============================================================

# Service d'email (sendgrid, mailgun, ses, smtp)
EMAIL_PROVIDER=sendgrid

# Clé API du service d'email
# Pour SendGrid : https://app.sendgrid.com/settings/api_keys
EMAIL_API_KEY=SG.votre-cle-api-sendgrid

# Email expéditeur (doit être vérifié dans SendGrid)
EMAIL_FROM=noreply@azakachans.ht
EMAIL_FROM_NAME=AZAKA CHANS

# ============================================================
# PAIEMENTS - MONCASH (Optionnel - à configurer plus tard)
# ============================================================

# URL de l'API MonCash
MONCASH_API_URL=https://moncash.digicelht.com/MoncashMboup/api

# Clé API MonCash (à obtenir auprès de Digicel)
MONCASH_API_KEY=votre-cle-moncash

# Secret MonCash (à obtenir auprès de Digicel)
MONCASH_API_SECRET=votre-secret-moncash

# URL de callback MonCash (doit être HTTPS en production)
MONCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/moncash/callback

# ============================================================
# PAIEMENTS - NATCASH (Optionnel - à configurer plus tard)
# ============================================================

# URL de l'API NatCash
NATCASH_API_URL=https://api.natcash.ht/v1

# Clé API NatCash (à obtenir auprès de NATCOM)
NATCASH_API_KEY=votre-cle-natcash

# Secret NatCash (à obtenir auprès de NATCOM)
NATCASH_API_SECRET=votre-secret-natcash

# URL de callback NatCash (doit être HTTPS en production)
NATCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/natcash/callback

# ============================================================
# JACKPOT - Configuration
# ============================================================

# Montant du jackpot (en HTG)
JACKPOT_AMOUNT=100000

# Catégories de tickets éligibles au jackpot (séparées par des virgules)
JACKPOT_CATEGORIES=50,250,500,1000

# ============================================================
# SÉCURITÉ - Recommandé
# ============================================================

# Rate limiting (requêtes par minute par IP)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# CORS origins autorisées (séparées par des virgules)
# En production : votre domaine Vercel
# En développement : http://localhost:3000
CORS_ORIGINS=https://azaka-chans.vercel.app,http://localhost:3000

# Clé secrète pour les cookies de session
# Générez avec : openssl rand -base64 32
COOKIE_SECRET=votre-secret-cookie-securise

# ============================================================
# LOGGING ET MONITORING (Optionnel)
# ============================================================

# Niveau de log (debug, info, warn, error)
LOG_LEVEL=info

# Sentry DSN pour le monitoring d'erreurs (optionnel)
# Créez un compte sur https://sentry.io
SENTRY_DSN=

# ============================================================
# DÉVELOPPEMENT (Ignoré en production)
# ============================================================

# Mode débogage (true/false)
DEBUG=false

# Afficher les logs SQL (true/false)
SQL_LOGGING=false
```

### 🎯 Variables OBLIGATOIRES (Minimum pour démarrer)

Si vous voulez démarrer rapidement, configurez **uniquement** ces variables :

```bash
# 1. Base de données
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# 2. Application
APP_URL=https://votre-domaine.vercel.app
NODE_ENV=production

# 3. Authentification
JWT_SECRET=votre-secret-jwt-genere-aleatoirement-min-32-caracteres
```

### 🔐 Comment Générer un JWT_SECRET Sécurisé

**Option 1 : Ligne de commande (Linux/Mac)**
```bash
openssl rand -base64 32
```

**Option 2 : Ligne de commande (Windows PowerShell)**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Option 3 : Générateur en ligne**
- Allez sur : https://generate-secret.vercel.app/32
- Copiez le résultat

**Option 4 : Node.js**
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('base64'));
```

---

## 3. Instructions de Déploiement

### 🚀 Déploiement sur Vercel

#### Étape 1 : Préparer le projet

```bash
# Cloner le dépôt (si ce n'est pas déjà fait)
git clone <votre-repo-url>
cd azaka-chans

# Installer les dépendances
npm install

# Créer le fichier .env.local pour le développement
cp .env.example .env.local

# Éditer .env.local avec vos valeurs
# (voir section "Variables d'Environnement" ci-dessus)
```

#### Étape 2 : Tester en local

```bash
# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000 dans votre navigateur
# Tester :
# - Inscription d'un nouvel utilisateur
# - Vérification de l'email
# - Connexion
# - Achat de tickets
# - Portefeuille
```

#### Étape 3 : Pousser vers Git

```bash
# Ajouter les modifications
git add .

# Commiter
git commit -m "Préparation pour déploiement"

# Pousser vers le dépôt distant
git push origin main
```

#### Étape 4 : Importer dans Vercel

1. Allez sur [https://vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub/GitLab/Bitbucket
3. Cliquez sur **"Add New..."** → **"Project"**
4. Importez votre dépôt Git
5. Vercel détecte automatiquement Vite comme framework

#### Étape 5 : Configurer les variables d'environnement

1. Dans les paramètres du projet Vercel, allez dans **"Environment Variables"**
2. Ajoutez **TOUTES** les variables listées ci-dessus
3. **Important** : Utilisez des valeurs différentes pour Production, Preview et Development

#### Étape 6 : Déployer

1. Cliquez sur **"Deploy"**
2. Attendez que le déploiement se termine (2-3 minutes)
3. Une fois terminé, cliquez sur le lien de votre application

#### Étape 7 : Tester en production

1. Accédez à votre URL Vercel (ex: https://azaka-chans.vercel.app)
2. Testez le parcours complet :
   - Inscription
   - Vérification email
   - Connexion
   - Achat de tickets
   - Portefeuille
   - Retraits

---

### 📱 Configuration PWA (Optionnel)

#### Générer les icônes PWA

Le fichier `public/icons/README.md` contient les instructions pour générer toutes les tailles d'icônes nécessaires.

**Méthode rapide avec ImageMagick :**

```bash
# Installer ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: https://imagemagick.org/script/download.php

# Générer les icônes
cd public/icons
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

---

### 🤖 Configuration Android (Optionnel)

Suivez le guide complet dans **`docs/PWABUILDER_ANDROID.md`** pour :

1. Analyser votre PWA avec PWABuilder
2. Générer le package Android
3. Tester sur émulateur et appareil
4. Publier sur Google Play Store

---

## ✅ Checklist de Déploiement

### Avant le déploiement

- [ ] Projet Neon créé
- [ ] Schéma SQL exécuté sur Neon
- [ ] URL de connexion Neon copiée
- [ ] JWT_SECRET généré
- [ ] Variables d'environnement préparées
- [ ] Tests locaux effectués
- [ ] Code poussé vers Git

### Pendant le déploiement

- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement configurées
- [ ] Déploiement lancé
- [ ] Build réussi (vérifier les logs Vercel)

### Après le déploiement

- [ ] Site accessible en production
- [ ] Inscription fonctionne
- [ ] Vérification email fonctionne
- [ ] Connexion fonctionne
- [ ] Portefeuille fonctionne
- [ ] Achat de tickets fonctionne
- [ ] Retraits fonctionnent

---

## 🆘 Dépannage

### Erreur : "Connection refused" à la base de données

**Cause** : L'URL de connexion à Neon est incorrecte

**Solution** :
1. Vérifiez `DATABASE_URL` dans Vercel
2. Assurez-vous que le format est correct : `postgresql://user:password@host.neon.tech/dbname?sslmode=require`
3. Vérifiez que la base de données est active dans Neon

### Erreur : "Table does not exist"

**Cause** : Le schéma SQL n'a pas été exécuté

**Solution** :
1. Retournez dans Neon SQL Editor
2. Exécutez `database/neon_schema.sql`
3. Vérifiez que toutes les tables sont créées

### Erreur : "Invalid JWT token"

**Cause** : Le JWT_SECRET est incorrect ou manquant

**Solution** :
1. Vérifiez que `JWT_SECRET` est configuré dans Vercel
2. Assurez-vous qu'il fait au moins 32 caractères
3. Régénérez-le si nécessaire

### Erreur : "Email not sent"

**Cause** : La configuration email est incorrecte

**Solution** :
1. Vérifiez `EMAIL_API_KEY` dans Vercel
2. Vérifiez que le domaine expéditeur est validé dans SendGrid
3. Consultez les logs Vercel pour plus de détails

### Erreur : "CORS error"

**Cause** : Les origines CORS ne sont pas configurées

**Solution** :
1. Ajoutez votre domaine dans `CORS_ORIGINS`
2. Redéployez sur Vercel

---

## 📞 Support

### Documentation

- **Guide de déploiement complet** : `docs/DEPLOYMENT_VERCEL_NEON.md`
- **Guide PWABuilder/Android** : `docs/PWABUILDER_ANDROID.md`
- **Rapport d'audit** : `AUDIT_DEPLOYMENT.md`
- **Documentation technique** : `DOCUMENTATION.md`

### Contact

- **Développeur** : Cleef Oligens JOSEPH
- **Email** : cleefolig@gmail.com
- **WhatsApp** : +509 44 61 76 00

### Ressources Externes

- **Vercel Docs** : https://vercel.com/docs
- **Neon Docs** : https://neon.tech/docs
- **PWABuilder** : https://www.pwabuilder.com

---

## 🎉 Félicitations !

Vous avez maintenant tout ce qu'il faut pour déployer AZAKA CHANS en production !

**Prochaines étapes :**
1. ✅ Créer un compte Neon
2. ✅ Exécuter le schéma SQL
3. ✅ Créer un compte Vercel
4. ✅ Configurer les variables d'environnement
5. ✅ Déployer l'application
6. ✅ Tester en production
7. 🎊 C'est parti !

---

**Dernière mise à jour** : 2024  
**Version** : 1.0.0

---

*Mèsi anpil. Rasin nou. Chans nou.* 🇭🇹✨
