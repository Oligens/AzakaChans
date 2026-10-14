# Guide de Test de Sécurité - AZAKA CHANS

Ce guide vous permet de vérifier manuellement que les mesures de sécurité sont correctement implémentées.

---

## 🧪 Tests à Effectuer

### Test 1: Protection des Routes Privées

**Objectif:** Vérifier que les visiteurs non connectés sont redirigés vers la page de connexion.

**Étapes:**

1. **Déconnectez-vous** (si vous êtes connecté)
   - Cliquez sur le bouton de déconnexion
   - Ou ouvrez une fenêtre de navigation privée

2. **Tentez d'accéder aux routes privées:**
   ```
   http://localhost:3000/portefeuille
   http://localhost:3000/mes-tickets
   http://localhost:3000/boutique
   http://localhost:3000/retrait
   ```

3. **Vérifiez le comportement:**
   - ✅ Vous devez être redirigé vers `/connexion`
   - ✅ L'URL d'origine doit être préservée dans l'état de navigation
   - ✅ Après connexion, vous devez être redirigé vers la page demandée

**Résultat attendu:** ✅ Redirection automatique vers `/connexion`

---

### Test 2: Isolation des Données entre Utilisateurs

**Objectif:** Vérifier qu'un utilisateur ne peut voir que ses propres données.

**Étapes:**

1. **Créez deux comptes utilisateur:**
   - User A: `userA@example.com` / `Password123!`
   - User B: `userB@example.com` / `Password123!`

2. **Connectez-vous avec User A:**
   - Ajoutez des fonds au portefeuille (ex: 5000 HTG)
   - Achetez 2 tickets
   - Notez l'ID des tickets achetés

3. **Déconnectez-vous**

4. **Connectez-vous avec User B:**
   - Vérifiez le portefeuille
   - ✅ Le solde doit être différent de User A
   - ✅ Les tickets de User A ne doivent PAS apparaître
   - ✅ L'historique des transactions doit être vide ou contenir uniquement les opérations de User B

5. **Tentez d'accéder aux données de User A:**
   - Ouvrez la console du navigateur (F12)
   - Tentez de modifier l'ID utilisateur dans les requêtes
   - ✅ Les données de User A ne doivent pas être accessibles

**Résultat attendu:** ✅ Isolation complète des données

---

### Test 3: Protection contre l'Accès aux Tickets d'Autrui

**Objectif:** Vérifier qu'un utilisateur ne peut pas révéler les tickets d'un autre utilisateur.

**Étapes:**

1. **Connectez-vous avec User A:**
   - Achetez un ticket
   - Notez l'ID du ticket (ex: `ticket-A-123`)

2. **Déconnectez-vous**

3. **Connectez-vous avec User B:**
   - Ouvrez la console du navigateur (F12)
   - Tentez de révéler le ticket de User A:
     ```javascript
     // Tenter d'appeler la fonction de révélation avec l'ID du ticket de User A
     import { revealTicket } from './services/userDataService';
     revealTicket('ticket-A-123');
     ```

4. **Vérifiez le résultat:**
   - ✅ La révélation doit être refusée
   - ✅ Message d'erreur: "Ce ticket ne vous appartient pas"
   - ✅ Le ticket de User A ne doit pas être modifié

**Résultat attendu:** ✅ Révélation refusée avec erreur d'autorisation

---

### Test 4: Protection des Opérations Financières

**Objectif:** Vérifier que les opérations financières sont protégées.

**Étapes:**

1. **Connectez-vous avec un utilisateur:**
   - Notez le solde actuel (ex: 5000 HTG)

2. **Tentez un retrait supérieur au solde:**
   - Allez sur `/retrait`
   - Entrez un montant supérieur au solde (ex: 10000 HTG)
   - ✅ Le retrait doit être refusé
   - ✅ Message: "Solde insuffisant"

3. **Tentez un retrait sans authentification:**
   - Déconnectez-vous
   - Tentez d'accéder à `/retrait`
   - ✅ Redirection vers `/connexion`

4. **Vérifiez la cohérence du solde:**
   - Effectuez plusieurs opérations (achat, retrait)
   - ✅ Le solde doit être cohérent avec l'historique des transactions
   - ✅ Pas de double débit ou crédit

**Résultat attendu:** ✅ Opérations financières protégées et cohérentes

---

### Test 5: Gestion des Sessions

**Objectif:** Vérifier que les sessions sont correctement gérées.

**Étapes:**

1. **Connectez-vous avec un utilisateur:**
   - Accédez au portefeuille
   - Vérifiez que les données sont affichées

2. **Simulez l'expiration de la session:**
   - Ouvrez la console du navigateur (F12)
   - Supprimez le token de session:
     ```javascript
     localStorage.removeItem('azaka_chans_session');
     ```
   - Rafraîchissez la page

3. **Vérifiez le comportement:**
   - ✅ Vous devez être redirigé vers `/connexion`
   - ✅ Les données privées ne doivent plus être accessibles
   - ✅ Pas de fuite de données après déconnexion

4. **Testez la déconnexion:**
   - Cliquez sur le bouton de déconnexion
   - ✅ Toutes les données privées doivent être effacées
   - ✅ Redirection vers la page d'accueil

**Résultat attendu:** ✅ Sessions correctement gérées

---

### Test 6: Protection contre les Attaques par Force Brute

**Objectif:** Vérifier que les tentatives de connexion sont limitées.

**Étapes:**

1. **Accédez à la page de connexion:**
   - `http://localhost:3000/connexion`

2. **Tentez plusieurs connexions échouées:**
   - Entrez un email valide avec un mauvais mot de passe
   - Répétez 5 fois

3. **Vérifiez le comportement:**
   - ✅ Après 5 tentatives, le compte doit être temporairement bloqué
   - ✅ Message: "Trop de tentatives. Veuillez réessayer dans 15 minutes"
   - ✅ Même avec le bon mot de passe, la connexion doit être refusée pendant le blocage

4. **Attendez la fin du blocage:**
   - Après 15 minutes, tentez à nouveau avec le bon mot de passe
   - ✅ La connexion doit fonctionner

**Résultat attendu:** ✅ Protection contre les attaques par force brute

---

### Test 7: Vérification d'Email

**Objectif:** Vérifier que la vérification d'email est obligatoire.

**Étapes:**

1. **Créez un nouveau compte:**
   - `http://localhost:3000/inscription`
   - Entrez un email et un mot de passe
   - ✅ Vous devez être redirigé vers la page de vérification

2. **Tentez de vous connecter sans vérifier l'email:**
   - Déconnectez-vous
   - Tentez de vous connecter avec le compte non vérifié
   - ✅ La connexion doit être refusée
   - ✅ Message: "Veuillez vérifier votre adresse email"

3. **Vérifiez l'email:**
   - Entrez le code de vérification reçu
   - ✅ L'email doit être marqué comme vérifié

4. **Connectez-vous avec le compte vérifié:**
   - ✅ La connexion doit fonctionner
   - ✅ Accès complet aux fonctionnalités

**Résultat attendu:** ✅ Vérification d'email obligatoire

---

### Test 8: Protection des Routes Admin

**Objectif:** Vérifier que les routes admin sont protégées.

**Étapes:**

1. **Connectez-vous avec un utilisateur standard:**
   - `http://localhost:3000/connexion`
   - Utilisez un compte avec le rôle `USER`

2. **Tentez d'accéder aux routes admin:**
   ```
   http://localhost:3000/gestion-privee
   http://localhost:3000/gestion-privee/architecture
   ```

3. **Vérifiez le comportement:**
   - ✅ Accès refusé
   - ✅ Message: "Accès refusé. Vous n'avez pas les permissions nécessaires"
   - ✅ Pas de fuite d'informations sur l'existence des routes

4. **Connectez-vous avec un compte admin:**
   - Utilisez un compte avec le rôle `ADMIN` ou `SUPER_ADMIN`
   - ✅ L'accès aux routes admin doit fonctionner

**Résultat attendu:** ✅ Routes admin correctement protégées

---

### Test 9: Protection contre les Injections

**Objectif:** Vérifier que les entrées utilisateur sont validées.

**Étapes:**

1. **Testez les formulaires avec des entrées malveillantes:**

   **Formulaire de connexion:**
   ```
   Email: admin' OR '1'='1
   Mot de passe: ' OR '1'='1
   ```
   - ✅ La connexion doit échouer
   - ✅ Pas d'erreur SQL affichée

   **Formulaire d'inscription:**
   ```
   Email: test@example.com<script>alert('XSS')</script>
   Mot de passe: Password123!
   ```
   - ✅ L'inscription doit échouer ou nettoyer les entrées
   - ✅ Pas d'exécution de script

2. **Testez les champs de recherche:**
   - Si des champs de recherche existent, testez avec:
     ```
     <script>alert('XSS')</script>
     ```
   - ✅ Les scripts ne doivent pas s'exécuter

3. **Vérifiez les messages d'erreur:**
   - ✅ Les messages d'erreur ne doivent pas révéler d'informations internes
   - ✅ Pas de stack traces ou de requêtes SQL affichées

**Résultat attendu:** ✅ Protection contre les injections

---

### Test 10: Audit de Sécurité des Headers HTTP

**Objectif:** Vérifier que les headers de sécurité sont configurés.

**Étapes:**

1. **Ouvrez les outils de développement du navigateur (F12)**

2. **Allez dans l'onglet "Network"**

3. **Rechargez la page**

4. **Cliquez sur la première requête (document)**

5. **Vérifiez les headers de réponse:**
   - ✅ `X-Content-Type-Options: nosniff`
   - ✅ `X-Frame-Options: DENY`
   - ✅ `X-XSS-Protection: 1; mode=block`
   - ✅ `Referrer-Policy: strict-origin-when-cross-origin`
   - ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=()`

6. **Vérifiez les cookies:**
   - ✅ Cookies de session doivent avoir le flag `HttpOnly`
   - ✅ Cookies de session doivent avoir le flag `Secure` (en production HTTPS)
   - ✅ Cookies de session doivent avoir `SameSite=Strict` ou `Lax`

**Résultat attendu:** ✅ Headers de sécurité correctement configurés

---

## 📊 Checklist de Vérification

### Frontend

- [ ] Routes privées redirigent vers `/connexion`
- [ ] URL de retour préservée après connexion
- [ ] Données privées effacées après déconnexion
- [ ] Pas de données sensibles dans localStorage
- [ ] Pas de secrets dans le code source
- [ ] Messages d'erreur génériques (pas d'infos internes)

### Backend (à vérifier en production)

- [ ] Middlewares d'authentification sur toutes les routes privées
- [ ] Vérification des tokens JWT
- [ ] Validation des entrées utilisateur
- [ ] Rate limiting configuré
- [ ] Audit logging activé
- [ ] Headers de sécurité configurés

### Base de Données (à vérifier en production)

- [ ] Row-Level Security (RLS) activé
- [ ] Politiques d'isolation des données
- [ ] Contraintes d'intégrité
- [ ] Index optimisés
- [ ] Sauvegardes régulières

### Authentification

- [ ] Hachage des mots de passe (SHA-256 + sel)
- [ ] Vérification d'email obligatoire
- [ ] Sessions sécurisées avec expiration
- [ ] Protection contre les attaques par force brute
- [ ] Déconnexion propre (effacement des données)

### Isolation des Données

- [ ] Filtrage par `userId` authentifié
- [ ] Vérification de propriété des ressources
- [ ] Prevention IDOR
- [ ] Pas de fuite de données entre utilisateurs
- [ ] Tests d'intrusion réguliers

---

## 🚨 Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité de sécurité:

1. **Ne la publiez pas publiquement**
2. **Contactez immédiatement:**
   - Email: cleefolig@gmail.com
   - WhatsApp: +509 44 61 76 00
3. **Fournissez:**
   - Description de la vulnérabilité
   - Étapes pour la reproduire
   - Impact potentiel
   - Suggestions de correction (si possible)

---

## 📚 Ressources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

---

**Dernière mise à jour:** 2024  
**Version:** 1.0.0

---

*Mèsi anpil. Rasin nou. Chans nou.* 🇭🇹✨
