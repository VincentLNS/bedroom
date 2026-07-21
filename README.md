# Mini Déco

Atelier de décoration 3D pour enfants (Vite + React Three Fiber).

## Local

```bash
npm install
npm run dev
```

```bash
npm test
npm run build
```

## Prod

- GitHub : https://github.com/VincentLNS/bedroom
- Vercel : https://bedroom-swart.vercel.app  
  Les **pull requests** reçoivent une preview Vercel automatiquement (projet déjà lié).

## CI

À chaque push / PR, GitHub Actions lance lint + tests + build (voir `.github/workflows/ci.yml`).

## Fonctions

- Maison multi-pièces (chambre / couloir / salon / cuisine / salle de bain) avec autosave complet
- Lien partageable (`?r=…`) + QR + Web Share photo
- Co-déco PeerJS, galerie locale, mode parent, sons / musique
- Qualité graphique **Auto** (allège Kenney + ombres sur tablettes faibles)
- Sauvegardes cloud locales (cet appareil), presets, défis, PWA
