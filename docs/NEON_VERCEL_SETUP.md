# AZAKA CHANS — État de la configuration Neon et Vercel

## État confirmé

- Projet Neon : `soft-moon-16427516` (`azaka chans`), région `aws-us-east-2`.
- Branche de production : `br-super-cherry-b4bmxp90` (`production`).
- Le schéma SQL a été appliqué avec succès dans la base `neondb`.
- Vérification après application : 13 tables, 3 vues, 51 routines PostgreSQL.
- Le schéma crée une ligne de configuration initiale du jackpot. Il ne crée aucun utilisateur de démonstration, dépôt, retrait ou gain.
- L'endpoint `GET /api/health` teste la connexion Neon sans révéler les identifiants ni le détail interne d'une erreur.

## Connexion Neon

PostgreSQL est déjà provisionné dans le projet. La CLI Neon n'a pas besoin d'un service `postgres` dans `--services` : ce paramètre est destiné aux services complémentaires déclarés dans `neon.ts`.

Pour connecter le dépôt local à ce projet, dans le terminal à la racine :

```bash
npm install
npm install -g neon@latest
neon link --org-id org-young-glade-15424327 --project-id soft-moon-16427516 --branch production -y
neon env pull
```

Si l'installation globale échoue, utiliser `npx neon@latest` à la place de `neon`. Si la CLI demande une connexion dans le navigateur, terminer l'authentification. Si elle échoue ou expire, lancer `neon login`, terminer la connexion, puis réessayer.

La CLI peut enregistrer les variables Neon dans `.env.local` ou `.env`. Ne jamais committer ces fichiers.

## Variables Vercel

Dans **Vercel → Project → Settings → Environment Variables**, ajouter les variables suivantes pour les environnements nécessaires :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | Chaîne de connexion **poolée** de Neon, hôte contenant `-pooler`; utilisée côté serveur |
| `APP_URL` | URL HTTPS réelle de l'application Vercel, sans slash final |
| `JWT_SECRET` | Secret aléatoire d'au moins 32 caractères, uniquement lorsque les endpoints d'authentification serveur sont implémentés |

Pour les migrations et outils d'administration uniquement, `DATABASE_URL_UNPOOLED` peut être définie avec la chaîne directe non poolée. Ne l'utilisez pas pour le trafic courant de l'application serverless.

Ne pas nommer la variable `VITE_DATABASE_URL) ou exposer la chaîne dans un composant React. Toute variable `VITE_*` est intégrée au bundle client et n'est pas appropriée pour un secret.

Générer un secret localement, sans le committer :

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Ne pas ajouter de clés fictives MonCash/NatCash ou d'email dans Vercel. N'ajouter ces secrets que lorsqu'une intégration serveur réelle et un contrat marchand ont été mis en place.

## Vérification

Après avoir configuré `DATABASE_URL` dans Vercel et déployé la branche qui contient le code :

- ouvrir `https://VOTRE-DOMAINE/api/health`;
- la réponse attendue est HTTP 200 avec `ok: true` et `service: "neon-postgres"`;
- si `DATABASE_URL` est absent ou si la connexion échoue, l'endpoint renvoie HTTP 503 sans divulguer le secret.

Commandes locales :

```bash
npm install
npm run typecheck
npm run build
```

Le serveur Vite seul ne sert pas les fonctions Vercel sous `/api`. Pour tester cette route en local, utiliser Vercel CLI (`vercel dev`) après avoir lié le projet et configuré les variables locales.

## Important — état fonctionnel réel

Le schéma Neon et l'endpoint de santé ne signifient pas que toutes les fonctions métier sont déjà connectées à PostgreSQL. L'application actuelle contient des données de démonstration en mémoire et un simulateur de paiements; l'inscription, les sessions, les tickets, les portefeuilles, les dépôts et les retraits doivent être migrés vers des endpoints serveur sécurisés avant un lancement réel. Ne pas vendre de tickets ni accepter de fonds sur la base des simulateurs.

## SQL et migrations

Le schéma initial est dans `database/neon_schema.sql`. Il a été testé sur une branche Neon de validation puis appliqué à la branche `production`. Comme il contient des créations de types PostgreSQL, ne pas réexécuter le script complet sur une base déjà initialisée. Toute évolution doit être ajoutée comme migration versionnée et testée sur une branche avant application en production.
