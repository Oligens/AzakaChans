# Images Générées pour AZAKA CHANS

## Images Disponibles

### 1. Arrière-plan Principal (16:9)
**URL:** https://image.qwenlm.ai/generated-images/50d405cd-26f0-43bb-a128-a9f68fff79fb/_result.png
**Dimensions:** 1920x1080
**Usage:** Arrière-plan principal de l'application
**Description:** Marbre bleu marine profond avec motifs géométriques haïtiens et lumière dorée ambiante

### 2. Colonne de Pièces (4:5)
**URL:** https://image.qwenlm.ai/generated-images/128daf2b-fef0-4cee-b7ce-f095a50d1292/_result.png
**Dimensions:** 1024x1280
**Usage:** Section jackpot et promotions
**Description:** Colonne de pièces de Gourde haïtiennes avec effets numériques

### 3. Assets de Jeu (Overlay)
**URL:** https://image.qwenlm.ai/generated-images/cfe6e9fc-4a42-4135-adf0-b11ebbfb5165/_result.png
**Dimensions:** 1024x1024
**Usage:** Overlay défilant, animations
**Description:** Pièces, perles et pépites d'or isolées

## Instructions d'Installation

Téléchargez les images depuis les URLs ci-dessus et placez-les dans ce dossier avec les noms suivants :
- `background-main.png` (image 1)
- `coins-column.png` (image 2)
- `game-assets.png` (image 3)

## Intégration dans l'Application

Les images peuvent être utilisées dans les composants React :

```tsx
// Arrière-plan principal
<div style={{ 
  backgroundImage: 'url(/images/background-main.png)',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}}>

// Section jackpot
<img src="/images/coins-column.png" alt="Jackpot" />

// Assets animés
<img src="/images/game-assets.png" alt="Assets" className="animate-float" />
```

## Palette de Couleurs

- Bleu marine profond: #102C57 / #07162E
- Or chaud: #C58C23 / #D4AF37
- Blanc cassé: #F4F6F9 / #F5F0E6
