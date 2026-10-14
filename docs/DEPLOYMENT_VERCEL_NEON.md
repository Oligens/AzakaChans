# Déploiement AZAKA CHANS — Vercel + Neon PostgreSQL

Le projet Neon de production existe déjà. Pour son état exact, les variables d'environnement et la vérification de la base, lire également [NEON_VERCEL_SETUP.md](./NEON_VERCEL_SETUP.md).

## 1. Préparer le dépôt

Dans un terminal à la racine du projet :

```bash
npm install
npm run typecheck
npm run build
```

Le projet utilise React, Vite et TypeScript. Vercel doit être configuré avec le framework Vite, la commande de build `npm run build` et le dossier de sortie `dist`.

## 2. Lier le projet Neon local

Le projet existant est `soft-moon-16427516`, organisation `org-young-glade-15424327`, branche `production`.

```bash
npm install -g neon@latest
neon link --org-id org-young-glade-15424327 --project-id soft-moon-16427516 --branch production -y
neon env pull
```

Si l'installation globale échoue, utiliser `npx neon@latest`. Si la CLI demande une authentification navigateur, terminer la connexion; si elle échoue ou expire, lancer `neon login`, puis réessayer.

PostgreSQL est déjà inclus dans le projet Neon. Ne pas passer `--services postgres` à `neon init` : ce drapeau est réservé aux services complémentaires déclarés dans `neon.ts`.

## 3. Schéma SQL

Le schéma initial se trouve dans `database/neon_schema.sql`. Il a été exécuté sur une branche de validation puis appliqué à la branche Neon `production`. La vérification a trouvé 13 tables, 3 vues et 51 routines.

**Ne pas exécuter de nouveau le script complet sur la base déjà initialisée**, car les types PostgreSQL personnalisés ne sont pas tous idempotents. Pour une modification future, créer une migration versionnée, la tester sur une branche Neon dédiée, puis la déployer séparément.

## 4. Variables Vercel

Dans **Vercel → Project → Settings → Environment Variables**, ajouter :

- `DATABASE_URL` : chaîne de connexion Neon poolée (hôte avec `-pooler`), pour les requêtes applicatives côté serveur.
- `APP_URL` : URL HTTPS réelle du projet, sans slash final.
- `JWT_SECRET` : secret aléatoire d'au moins 32 caractères uniquement quand les endpoints d'authentification côté serveur sont réellement utilisés.

Pour les migrations seulement, `DATABASE_URL_UNPOOLED` peut contenir la chaîne directe non poolée. Ne jamais mettre la chaîne de connexion dans une variable `VITE_*`, dans le code frontend ou dans Git.

Générer un secret avec :

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Ne pas renseigner de fausses clés MonCash/NatCash. Les secrets de paiement doivent provenir des comptes marchands autorisés et être utilisés exclusivement côté serveur.

## 5. Tester la connexion

Après avoir déployé la branche qui contient `api/health.ts`, ouvrir :

```text
https://VOTRE-DOMAINE/api/health
```

Une connexion réussie renvoie HTTP 200 et un JSON avec `ok: true` et `service: "neon-postgres"`. Si la variable manque ou si la connexion échoue, la réponse est HTTP 503 sans divulguer d'identifiants.

Vite seul ne sert pas les fonctions Vercel sous `/api`. Pour tester localement cette route, utiliser `vercel dev` après avoir lié le projet et configuré les variables locales.

## 6. État fonctionnel et sécurité

La base Neon est créée et le point de contrôle de connexion est disponible dans la branche de préparation. Cela ne signifie pas que toutes les fonctionnalités métier sont déjà reliées à PostgreSQL. Le code existant contient des données de démonstration en mémoire et un simulateur de paiement. Avant toute mise en production commerciale, il faut migrer l'inscription, les sessions, les tickets, les portefeuilles, les dépôts et les retraits vers des API serveur sécurisées, puis tester les parcours de bout en bout.

Ne pas accepter de paiements réels ni vendre de tickets tant que les intégrations de paiement, l'autorisation réglementaire et les contrôles financiers n'ont pas été vérifiés.
