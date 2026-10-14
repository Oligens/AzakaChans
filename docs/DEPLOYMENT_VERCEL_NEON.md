# Guide de Déploiement - Vercel & Neon PostgreSQL

Ce guide vous accompagne pas à pas pour déployer AZAKA CHANS sur Vercel avec une base de données Neon PostgreSQL.

## 📋 Prérequis

- [ ] Compte Vercel (gratuit sur https://vercel.com)
- [ ] Compte Neon (gratuit sur https://neon.tech)
- [ ] Git installé sur votre machine
- [ ] Node.js 18+ installé
- [ ] npm ou yarn

---

## 🗄️ ÉTAPE 1 : Configuration de Neon PostgreSQL

### 1.1 Créer un projet Neon

1. Connectez-vous à [Neon](https://neon.tech)
2. Cliquez sur **"New Project"**
3. Nommez votre projet : `azaka-chans`
4. Sélectionnez la région la plus proche (ex: `US East` pour Haïti)
5. Cliquez sur **"Create Project"**

### 1.2 Récupérer l'URL de connexion

1. Dans le tableau de bord Neon, allez dans **"Connection Details"**
2. Copiez l'**URL de connexion** (format : `postgresql://user:password@host.neon.tech/dbname`)
3. **Important** : Conservez cette URL en lieu sûr

### 1.3 Exécuter le schéma SQL

1. Dans Neon, allez dans **"SQL Editor"**
2. Copiez le contenu de `database/neon_schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **"Run"**
5. Vérifiez que toutes les tables sont créées sans erreur

### 1.4 Vérifier la création des tables

Exécutez cette requête pour vérifier :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir :
- audit_logs
- deposits
- email_verifications
- jackpot_state
- jackpot_victories
- sessions
- ticket_batches
- tickets
- transactions
- user_profiles
- users
- wallets
- withdrawals

---

## 🚀 ÉTAPE 2 : Configuration de Vercel

### 2.1 Préparer le dépôt Git

```bash
# Initialiser Git si ce n'est pas déjà fait
git init
git add .
git commit -m "Initial commit - AZAKA CHANS"

# Créer un dépôt sur GitHub/GitLab/Bitbucket
# puis pousser votre code
git remote add origin https://github.com/votre-username/azaka-chans.git
git push -u origin main
```

### 2.2 Importer le projet dans Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre dépôt Git
4. Vercel détecte automatiquement Vite comme framework

### 2.3 Configurer les variables d'environnement

Dans les paramètres du projet Vercel, allez dans **"Environment Variables"** et ajoutez :

#### Variables obligatoires

```bash
# Base de données
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Application
APP_URL=https://azaka-chans.vercel.app
NODE_ENV=production

# Authentification
JWT_SECRET=votre-secret-jwt-tres-long-et-securise-min-32-caracteres
SESSION_DURATION=86400
EMAIL_VERIFICATION_DURATION=600
MAX_VERIFICATION_ATTEMPTS=5
```

#### Variables optionnelles (à configurer plus tard)

```bash
# Email (SendGrid, Mailgun, etc.)
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=votre-cle-api-sendgrid
EMAIL_FROM=noreply@azakachans.ht

# Paiements (MonCash)
MONCASH_API_KEY=votre-cle-moncash
MONCASH_API_SECRET=votre-secret-moncash
MONCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/moncash/callback

# Paiements (NatCash)
NATCASH_API_KEY=votre-cle-natcash
NATCASH_API_SECRET=votre-secret-natcash
NATCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/natcash/callback

# Sécurité
COOKIE_SECRET=votre-secret-cookie-securise
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring (optionnel)
SENTRY_DSN=votre-dsn-sentry
```

### 2.4 Déployer le projet

1. Cliquez sur **"Deploy"**
2. Attendez que le déploiement se termine (2-3 minutes)
3. Une fois terminé, cliquez sur le lien de votre application

---

## 🔗 ÉTAPE 3 : Tester la connexion à la base de données

### 3.1 Créer un endpoint de test

Créez un fichier `api/test-db.js` à la racine du projet :

```javascript
import { Pool } from 'pg';

export default async function handler(req, res) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.status(200).json({
      success: true,
      message: 'Connexion à la base de données réussie',
      serverTime: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
}
```

### 3.2 Tester l'endpoint

Accédez à : `https://votre-domaine.vercel.app/api/test-db`

Vous devriez voir :
```json
{
  "success": true,
  "message": "Connexion à la base de données réussie",
  "serverTime": "2024-..."
}
```

---

## 🔐 ÉTAPE 4 : Configuration de la sécurité

### 4.1 Configurer les domaines personnalisés (optionnel)

1. Dans Vercel, allez dans **"Settings"** → **"Domains"**
2. Ajoutez votre domaine personnalisé (ex: `azakachans.ht`)
3. Suivez les instructions pour configurer les DNS

### 4.2 Activer HTTPS

Vercel active automatiquement HTTPS pour tous les domaines.

### 4.3 Configurer les en-têtes de sécurité

Le fichier `vercel.json` inclut déjà les en-têtes de sécurité :
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

---

## 📧 ÉTAPE 5 : Configuration de l'envoi d'emails

### 5.1 Créer un compte SendGrid (recommandé)

1. Inscrivez-vous sur [SendGrid](https://sendgrid.com)
2. Vérifiez votre domaine expéditeur
3. Créez une clé API

### 5.2 Configurer dans Vercel

Ajoutez dans les variables d'environnement Vercel :

```bash
EMAIL_PROVIDER=sendgrid
EMAIL_API_KEY=SG.votre-cle-api-sendgrid
EMAIL_FROM=noreply@azakachans.ht
EMAIL_FROM_NAME=AZAKA CHANS
```

### 5.3 Tester l'envoi d'email

Créez un endpoint de test `api/test-email.js` :

```javascript
import sgMail from '@sendgrid/mail';

export default async function handler(req, res) {
  sgMail.setApiKey(process.env.EMAIL_API_KEY);

  const msg = {
    to: 'votre-email@test.com',
    from: process.env.EMAIL_FROM,
    subject: 'Test AZAKA CHANS',
    text: 'Ceci est un email de test',
    html: '<strong>Ceci est un email de test</strong>',
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true, message: 'Email envoyé' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

---

## 💳 ÉTAPE 6 : Configuration des paiements

### 6.1 MonCash

1. Contactez Digicel pour obtenir vos identifiants marchands
2. Configurez les variables dans Vercel :
   ```bash
   MONCASH_API_KEY=votre-cle
   MONCASH_API_SECRET=votre-secret
   MONCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/moncash/callback
   ```

### 6.2 NatCash

1. Contactez NATCOM pour obtenir vos identifiants marchands
2. Configurez les variables dans Vercel :
   ```bash
   NATCASH_API_KEY=votre-cle
   NATCASH_API_SECRET=votre-secret
   NATCASH_CALLBACK_URL=https://azaka-chans.vercel.app/api/payments/natcash/callback
   ```

---

## 🧪 ÉTAPE 7 : Tests de validation

### 7.1 Checklist de déploiement

- [ ] Le site charge correctement sur Vercel
- [ ] La connexion à la base de données fonctionne
- [ ] L'inscription crée un utilisateur en base
- [ ] La vérification email envoie un code
- [ ] Le code de vérification est valide
- [ ] La connexion fonctionne après vérification
- [ ] Le portefeuille affiche le bon solde
- [ ] Les tickets s'achètent correctement
- [ ] Les retraits sont créés en base

### 7.2 Commandes de test

```bash
# Tests locaux
npm run dev

# Build de production
npm run build

# Vérification TypeScript
npm run typecheck

# Linting
npm run lint
```

---

## 🚨 Dépannage

### Erreur : "Connection refused"

**Cause** : L'URL de connexion à la base de données est incorrecte

**Solution** :
1. Vérifiez `DATABASE_URL` dans Vercel
2. Assurez-vous que le format est correct
3. Vérifiez que la base de données est active dans Neon

### Erreur : "Table does not exist"

**Cause** : Le schéma SQL n'a pas été exécuté

**Solution** :
1. Retournez dans Neon SQL Editor
2. Exécutez `database/neon_schema.sql`
3. Vérifiez que toutes les tables sont créées

### Erreur : "CORS error"

**Cause** : Les origines CORS ne sont pas configurées

**Solution** :
1. Ajoutez votre domaine dans `CORS_ORIGINS`
2. Redéployez sur Vercel

### Erreur : "Email not sent"

**Cause** : La configuration email est incorrecte

**Solution** :
1. Vérifiez `EMAIL_API_KEY` dans Vercel
2. Vérifiez que le domaine expéditeur est validé dans SendGrid
3. Consultez les logs Vercel pour plus de détails

---

## 📊 Monitoring et Logs

### Consulter les logs Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur **"Deployments"**
3. Sélectionnez le déploiement actif
4. Cliquez sur **"Functions"** pour voir les logs

### Monitoring de la base de données Neon

1. Allez dans le tableau de bord Neon
2. Consultez **"Metrics"** pour les performances
3. Consultez **"Logs"** pour les erreurs

---

## 🔄 Mises à jour

### Déployer une mise à jour

```bash
# Pousser vos modifications
git add .
git commit -m "Update: description des changements"
git push origin main

# Vercel déploie automatiquement
```

### Exécuter des migrations

Si vous modifiez le schéma de base de données :

1. Créez un fichier de migration dans `database/migrations/`
2. Exécutez-le dans Neon SQL Editor
3. Mettez à jour votre code pour utiliser les nouvelles tables

---

## 📞 Support

- **Vercel Docs** : https://vercel.com/docs
- **Neon Docs** : https://neon.tech/docs
- **Support AZAKA CHANS** : cleefolig@gmail.com

---

## ✅ Checklist finale de déploiement

- [ ] Projet Neon créé et schéma exécuté
- [ ] Projet Vercel créé et déployé
- [ ] Variables d'environnement configurées
- [ ] Connexion à la base de données testée
- [ ] Envoi d'emails configuré et testé
- [ ] Paiements configurés (si applicable)
- [ ] Tests de validation effectués
- [ ] Monitoring en place
- [ ] Documentation mise à jour

---

**Dernière mise à jour** : 2024  
**Version** : 1.0.0
