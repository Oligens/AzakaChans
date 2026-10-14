# Icônes PWA - AZAKA CHANS

## Icônes générées

### Icône principale (512x512)
**URL:** https://image.qwenlm.ai/generated-images/6255b224-4ac1-45da-abed-97e0706df322/_result.png

**Description:** Étoile dorée sur fond bleu marine profond

## Instructions d'installation

### 1. Télécharger l'icône principale

Téléchargez l'image depuis l'URL ci-dessus et enregistrez-la sous :
```
public/icons/icon-512x512.png
```

### 2. Générer les autres tailles

Utilisez un outil de redimensionnement pour créer toutes les tailles requises :

#### Option A : Utiliser ImageMagick (en ligne de commande)

```bash
# Installer ImageMagick si nécessaire
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: https://imagemagick.org/script/download.php

# Générer toutes les tailles
cd public/icons

# Taille 72x72
convert icon-512x512.png -resize 72x72 icon-72x72.png

# Taille 96x96
convert icon-512x512.png -resize 96x96 icon-96x96.png

# Taille 128x128
convert icon-512x512.png -resize 128x128 icon-128x128.png

# Taille 144x144
convert icon-512x512.png -resize 144x144 icon-144x144.png

# Taille 152x152
convert icon-512x512.png -resize 152x152 icon-152x152.png

# Taille 192x192
convert icon-512x512.png -resize 192x192 icon-192x192.png

# Taille 384x384
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

#### Option B : Utiliser un outil en ligne

1. Allez sur https://www.iloveimg.com/resize-image
2. Uploadez `icon-512x512.png`
3. Redimensionnez pour chaque taille requise
4. Téléchargez et placez dans `public/icons/`

#### Option C : Utiliser un script Node.js

Créez un fichier `scripts/generate-icons.js` :

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384];
const sourceIcon = path.join(__dirname, '../public/icons/icon-512x512.png');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(sourceIcon)
      .resize(size, size)
      .toFile(outputPath);
    console.log(`Generated: icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
```

Exécutez avec :
```bash
npm install sharp
node scripts/generate-icons.js
```

### 3. Icônes pour les raccourcis (shortcuts)

Créez également ces icônes pour les raccourcis du manifest :

- `public/icons/shop.png` (96x96) - Icône pour la Boutique
- `public/icons/wallet.png` (96x96) - Icône pour le Portefeuille
- `public/icons/tickets.png` (96x96) - Icône pour les Tickets

Vous pouvez utiliser des icônes de Lucide React converties en PNG :
- Shop : https://lucide.dev/icons/shopping-bag
- Wallet : https://lucide.dev/icons/wallet
- Tickets : https://lucide.dev/icons/ticket

### 4. Captures d'écran pour le manifest

Créez des captures d'écran pour le manifest PWA :

- `public/screenshots/desktop-home.png` (1280x720)
- `public/screenshots/mobile-home.png` (720x1280)

Prenez des captures d'écran de votre application déployée.

## Vérification

Après avoir généré toutes les icônes, vérifiez que tous les fichiers sont présents :

```bash
ls -la public/icons/
```

Vous devriez voir :
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
- icon.svg
- shop.png
- wallet.png
- tickets.png

## Test PWA

Après le déploiement, testez la PWA :

1. Ouvrez votre site dans Chrome
2. Appuyez sur F12 → Onglet "Application"
3. Vérifiez "Manifest" : doit être valide
4. Vérifiez "Icons" : toutes les icônes doivent être chargées
5. Testez l'installation : cliquez sur l'icône d'installation dans la barre d'adresse

## Notes

- Les icônes doivent être en PNG 32-bit avec canal alpha
- L'icône maskable doit avoir une zone de sécurité de 80%
- Le fond doit être le bleu marine (#07162E)
- L'étoile doit être dorée (#D4AF37)
- Respectez les marges pour les icônes maskable

## Support

Pour toute question : cleefolig@gmail.com
