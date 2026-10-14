# Guide PWABuilder & Android - AZAKA CHANS

Ce guide vous accompagne pour transformer AZAKA CHANS en application Android via PWABuilder.

## 📋 Prérequis

- [ ] Site déployé sur Vercel avec HTTPS (voir `DEPLOYMENT_VERCEL_NEON.md`)
- [ ] PWA fonctionnelle et installable
- [ ] Compte Google Play Developer (pour publier sur Play Store)
- [ ] Android Studio (pour tester localement)

---

## 🎯 ÉTAPE 1 : Vérifier que la PWA est prête

### 1.1 Checklist PWA

Avant d'utiliser PWABuilder, vérifiez que :

- [ ] Le site est accessible en HTTPS
- [ ] Le fichier `manifest.webmanifest` est présent et valide
- [ ] Le service worker `sw.js` est enregistré
- [ ] Toutes les icônes sont accessibles
- [ ] L'application fonctionne en mode standalone
- [ ] Les routes fonctionnent après actualisation
- [ ] La page hors ligne `offline.html` fonctionne

### 1.2 Tester la PWA localement

```bash
# Lancer le serveur de développement
npm run dev

# Ouvrir dans Chrome
# Appuyer sur F12 → Onglet "Application"
# Vérifier :
# - Manifest : doit être valide
# - Service Workers : doit être actif
# - Cache Storage : doit contenir les ressources
```

### 1.3 Tester l'installation

1. Ouvrez votre site dans Chrome
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. L'application doit s'installer et s'ouvrir en mode standalone

---

## 🔍 ÉTAPE 2 : Analyser avec PWABuilder

### 2.1 Accéder à PWABuilder

1. Allez sur [https://www.pwabuilder.com](https://www.pwabuilder.com)
2. Entrez l'URL de votre site déployé : `https://azaka-chans.vercel.app`
3. Cliquez sur **"Start"**

### 2.2 Analyser les résultats

PWABuilder va analyser votre PWA et afficher :

#### ✅ Score de qualité
- **Manifest** : Doit être > 80%
- **Service Worker** : Doit être actif
- **Security** : HTTPS obligatoire
- **Performance** : Score Lighthouse

#### 🔧 Problèmes détectés

PWABuilder peut détecter :
- Icônes manquantes ou trop petites
- Manifest incomplet
- Service worker non enregistré
- Problèmes de performance
- Erreurs de sécurité

### 2.3 Corriger les problèmes

#### Problème : Icônes manquantes

**Solution** :
1. Créez les icônes aux tailles requises :
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
2. Placez-les dans `public/icons/`
3. Mettez à jour `manifest.webmanifest`
4. Redéployez sur Vercel

#### Problème : Manifest incomplet

**Solution** :
1. Vérifiez que `manifest.webmanifest` contient tous les champs requis :
   - `name`
   - `short_name`
   - `start_url`
   - `display`
   - `background_color`
   - `theme_color`
   - `icons`

#### Problème : Service worker non enregistré

**Solution** :
Ajoutez dans `src/main.tsx` :

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW enregistré:', registration);
      })
      .catch((error) => {
        console.log('Erreur SW:', error);
      });
  });
}
```

---

## 📱 ÉTAPE 3 : Générer le package Android

### 3.1 Options de packaging

PWABuilder propose plusieurs options :

#### Option 1 : TWA (Trusted Web Activity) - Recommandé

**Avantages** :
- Application native Android
- Utilise Chrome pour afficher la PWA
- Accès aux APIs Android
- Publication sur Play Store

**Configuration** :
- **Package Name** : `ht.com.awore.azakachans` (ou votre domaine inversé)
- **Host** : `azaka-chans.vercel.app`
- **Name** : `AZAKA CHANS`
- **Short Name** : `AZAKA`
- **Theme Color** : `#D4AF37`
- **Background Color** : `#07162E`
- **Navigation Type** : `Custom Tabs`

#### Option 2 : APK Direct

**Avantages** :
- Plus simple
- Pas besoin de Play Store
- Installation directe

**Inconvénients** :
- Moins de fonctionnalités natives
- Distribution plus complexe

### 3.2 Générer le package

1. Dans PWABuilder, cliquez sur **"Package for Stores"**
2. Sélectionnez **"Android"**
3. Remplissez les informations :

```
Package Name: ht.com.awore.azakachans
Name: AZAKA CHANS
Short Name: AZAKA
Launcher Name: AZAKA CHANS
Background Color: #07162E
Theme Color: #D4AF37
Icon URL: https://azaka-chans.vercel.app/icons/icon-512x512.png
Maskable Icon URL: https://azaka-chans.vercel.app/icons/icon-512x512.png
Splash Fade Out: true
Upgrade Behavior: Install and update
```

4. Cliquez sur **"Generate"**
5. Téléchargez le fichier `.zip` contenant le projet Android

### 3.3 Structure du projet Android

Le fichier ZIP contient :

```
android-project/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/ht/com/awore/azakachans/
│   │   │   │   └── LauncherActivity.java
│   │   │   ├── res/
│   │   │   │   ├── mipmap-*/
│   │   │   │   │   └── ic_launcher.png
│   │   │   │   ├── values/
│   │   │   │   │   └── strings.xml
│   │   │   │   └── xml/
│   │   │   │       └── shortcuts.xml
│   │   │   └── AndroidManifest.xml
│   │   └── test/
│   └── build.gradle
├── build.gradle
├── gradle.properties
└── settings.gradle
```

---

## 🛠️ ÉTAPE 4 : Construire l'APK/AAB

### 4.1 Option A : Utiliser Android Studio (Recommandé)

#### Installation

1. Téléchargez [Android Studio](https://developer.android.com/studio)
2. Installez-le et configurez le SDK Android

#### Importer le projet

1. Ouvrez Android Studio
2. Cliquez sur **"Open an existing project"**
3. Sélectionnez le dossier `android-project` extrait
4. Attendez que Gradle synchronise

#### Construire l'APK

```bash
# Dans Android Studio :
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# Ou en ligne de commande :
./gradlew assembleRelease
```

L'APK sera généré dans : `app/build/outputs/apk/release/app-release.apk`

#### Construire l'AAB (pour Play Store)

```bash
# Dans Android Studio :
# Build → Build Bundle(s) / APK(s) → Build Bundle(s)

# Ou en ligne de commande :
./gradlew bundleRelease
```

L'AAB sera généré dans : `app/build/outputs/bundle/release/app-release.aab`

### 4.2 Option B : Utiliser la ligne de commande

```bash
# Installer les dépendances
cd android-project
./gradlew build

# Construire l'APK debug
./gradlew assembleDebug

# Construire l'APK release
./gradlew assembleRelease

# Construire l'AAB
./gradlew bundleRelease
```

---

## 🧪 ÉTAPE 5 : Tester l'application Android

### 5.1 Tester sur émulateur

1. Dans Android Studio, créez un émulateur :
   - **Tools** → **Device Manager** → **Create Device**
   - Sélectionnez un appareil (ex: Pixel 6)
   - Téléchargez une image système (ex: Android 13)
   - Cliquez sur **"Finish"**

2. Lancez l'émulateur

3. Installez l'APK :
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

4. Testez l'application

### 5.2 Tester sur appareil physique

1. Activez le **mode développeur** sur votre téléphone Android :
   - **Paramètres** → **À propos du téléphone**
   - Tapez 7 fois sur **"Numéro de build"**

2. Activez le **débogage USB** :
   - **Paramètres** → **Options développeur** → **Débogage USB**

3. Connectez votre téléphone en USB

4. Installez l'APK :
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

5. Testez l'application

### 5.3 Checklist de test

- [ ] L'application s'installe correctement
- [ ] L'icône s'affiche sur l'écran d'accueil
- [ ] L'application s'ouvre en plein écran
- [ ] La navigation fonctionne
- [ ] Les routes fonctionnent
- [ ] Le mode hors ligne fonctionne
- [ ] Les notifications push fonctionnent (si configurées)
- [ ] Les liens profonds fonctionnent
- [ ] Le partage fonctionne
- [ ] Les raccourcis fonctionnent

---

## 🔐 ÉTAPE 6 : Signer l'application

### 6.1 Générer une clé de signature

```bash
keytool -genkey -v -keystore azaka-chans.keystore -alias azaka-chans -keyalg RSA -keysize 2048 -validity 10000
```

Entrez les informations demandées :
- Mot de passe du keystore
- Nom et prénom
- Unité organisationnelle
- Organisation
- Ville
- État/Province
- Code pays (HT)

### 6.2 Configurer la signature

Dans `app/build.gradle` :

```gradle
android {
    signingConfigs {
        release {
            storeFile file('azaka-chans.keystore')
            storePassword 'votre-mot-de-passe'
            keyAlias 'azaka-chans'
            keyPassword 'votre-mot-de-passe'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 6.3 Reconstruire l'application signée

```bash
./gradlew clean
./gradlew assembleRelease
```

---

## 📤 ÉTAPE 7 : Publier sur Google Play Store

### 7.1 Créer un compte Google Play Developer

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Payez les frais d'inscription unique (25$)
3. Complétez votre profil de développeur

### 7.2 Créer une nouvelle application

1. Cliquez sur **"Créer une application"**
2. Remplissez les informations :
   - **Nom de l'application** : AZAKA CHANS
   - **Langue par défaut** : Français
   - **Type d'application** : Application
   - **Catégorie** : Divertissement

### 7.3 Préparer la fiche Play Store

#### Informations requises

- **Description courte** (80 caractères max) :
  ```
  La loterie haïtienne nouvelle génération. Rasin nou. Chans nou.
  ```

- **Description complète** (4000 caractères max) :
  ```
  AZAKA CHANS est la plateforme de loterie numérique d'Haïti.
  
  🎫 Achetez des tickets physiques ou virtuels
  💰 Gagnez jusqu'à 100 000 HTG
  📱 Retirez vos gains via MonCash ou NatCash
  🔒 Sécurité maximale et transparence totale
  
  Fonctionnalités :
  • Tickets de 50, 250, 500 et 1 000 HTG
  • Jackpot itinérant de 100 000 HTG
  • Portefeuille sécurisé
  • Historique complet des transactions
  • Interface premium et intuitive
  
  Rasin nou. Chans nou.
  ```

#### Images requises

- **Icône** : 512x512 px (PNG 32-bit)
- **Image de présentation** : 1024x500 px
- **Captures d'écran** : Minimum 2, maximum 8
  - Téléphone : 16:9 ou 9:16
  - Tablette 7" : 16:9 ou 9:16
  - Tablette 10" : 16:9 ou 9:16

### 7.4 Uploader l'AAB

1. Dans Play Console, allez dans **"Production"**
2. Cliquez sur **"Créer une version"**
3. Uploadez votre fichier `.aab`
4. Remplissez les informations de version

### 7.5 Configurer le classement du contenu

1. Répondez au questionnaire de classification
2. Obtenez votre certificat de classification

### 7.6 Configurer les prix et la distribution

1. **Prix** : Gratuit
2. **Pays** : Haïti (et autres pays si applicable)
3. **Contenu** : Tout public (ou selon votre classification)

### 7.7 Soumettre pour examen

1. Vérifiez que tous les champs sont remplis
2. Cliquez sur **"Envoyer pour examen"**
3. Attendez l'approbation (généralement 1-3 jours)

---

## 🔄 ÉTAPE 8 : Mises à jour

### 8.1 Mettre à jour la PWA

```bash
# Modifiez votre code
git add .
git commit -m "Update: description"
git push origin main

# Vercel redéploie automatiquement
```

### 8.2 Mettre à jour l'application Android

1. Incrémentez `versionCode` et `versionName` dans `app/build.gradle` :
   ```gradle
   android {
       defaultConfig {
           versionCode 2  // Incrémenter
           versionName "1.1.0"  // Nouvelle version
       }
   }
   ```

2. Reconstruisez l'AAB :
   ```bash
   ./gradlew bundleRelease
   ```

3. Uploadez le nouveau AAB dans Play Console

---

## 🚨 Dépannage

### Erreur : "Package name already exists"

**Solution** : Changez le package name dans `build.gradle`

### Erreur : "Signature verification failed"

**Solution** : Vérifiez que vous utilisez le bon keystore et les bons mots de passe

### Erreur : "App not installed"

**Solution** :
- Désinstallez l'ancienne version
- Vérifiez que le `versionCode` est supérieur à la version précédente

### Erreur : "Manifest merge failed"

**Solution** : Vérifiez les conflits dans `AndroidManifest.xml`

---

## 📞 Support

- **PWABuilder Docs** : https://docs.pwabuilder.com
- **Android Docs** : https://developer.android.com/docs
- **Play Console Help** : https://support.google.com/google-play/android-developer
- **Support AZAKA CHANS** : cleefolig@gmail.com

---

## ✅ Checklist finale

- [ ] PWA fonctionnelle et installable
- [ ] PWABuilder analyse réussie
- [ ] Package Android généré
- [ ] Application testée sur émulateur
- [ ] Application testée sur appareil physique
- [ ] Application signée
- [ ] Fiche Play Store complète
- [ ] Images et captures d'écran prêtes
- [ ] Application soumise pour examen
- [ ] Application approuvée et publiée

---

**Dernière mise à jour** : 2024  
**Version** : 1.0.0
