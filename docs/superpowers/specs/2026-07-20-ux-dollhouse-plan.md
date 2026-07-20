# Plan UX — Chambre Louise (vue & utilisabilité)

**Date :** 2026-07-20  
**Contexte :** la chambre « flotte » dans le vide, les 4 murs pleins gênent le placement, l’orbite libre est trop chaotique pour un outil de décoration.

## Diagnostic actuel

| Problème | Cause technique | Sensation |
|----------|-----------------|-----------|
| Chambre dans l’espace | Fond plat `#f7efe8` + pas de socle / sol d’atelier | Objet 3D flottant |
| Murs gênants | 4 murs opaques toujours visibles | Impossible de bien voir / cliquer |
| Navigation confuse | Orbit 360° libre + mode Place qui coupe rotate/pan | « Je suis coincé avec un meuble au curseur » |
| UI anglaise | TopBar / catalogue / toolbars en EN | Pas cohérent pour Louise |

## Références marché (meilleures pratiques)

### Jeux / deco fun
| Ref | Pattern clé à reprendre |
|-----|-------------------------|
| **The Sims** (Build Mode) | Murs en **coupes** (plein / mi-hauteur / invisibles) ; caméra orbit **contrainte** ; grille au sol |
| **Animal Crossing** (déco intérieure) | Angle **dollhouse** quasi fixe ; murs souvent **coupés** en haut ; drag simple |
| **Tous les jeux « dollhouse »** | Vue ¾ haute ; plafond absent ; 1–2 murs masqués côté caméra |

### Outils déco / planners
| Ref | Pattern clé |
|-----|-------------|
| **Planner 5D** | Bascule **2D plan / 3D** ; drag catalogue ; murs stables |
| **IKEA Kreativ / Place** | Room ancrée dans un **contexte** ; placement au sol clair |
| **Roomstyler / Homestyler** | Vue ¾ + fond atelier ; pas de « boîte fermée » pendant l’édition |
| **RoomSketcher** | Live 3D + plan 2D ; murs éditables mais vue lisible |
| **Arcadium 3D** | Modes dollhouse + 1re personne |

### Synthèse : ce que font presque tous les bons outils

1. **Pas de boîte fermée pendant l’édition** — plafond off, murs face caméra transparents ou coupés.
2. **Socle / sol d’atelier** sous la pièce — ombre portée, plus de flottement.
3. **Caméra dollhouse** par défaut (polar angle limité, distance clampée) — orbit libre = mode expert optionnel.
4. **Bascule 2D / 3D** (nice-to-have) pour poser vite, vérifier en 3D.
5. **UI 100 % langue cible** + libellés d’actions courts (Poser / Tourner / Supprimer).

---

## Direction produit (recommandée)

**Mode édition = « maison de poupée »**, pas « boîte fermée en apesanteur ».

```
Avant                          Après
┌────────────┐                 ╭──────────────╮
│ ████ murs  │                 │ murs coupés  │
│   chambre  │  →              │   chambre    │
│  flottante │                 │ ▓▓▓ socle ▓▓ │
└────────────┘                 ╰──────────────╯
     fond plat                   atelier + ombre
```

---

## Plan d’action (phases)

### Phase A — Ancrage & lisibilité *(priorité P0, ~1 session)*
1. **Socle** sous le sol (plateau bois/béton clair + légère ombre contact)
2. **Fond atelier** : dégradé doux ou grille perspective (pas un aplats vide)
3. **Caméra dollhouse** : `minPolarAngle` / `maxPolarAngle` serrés, `minDistance` / `maxDistance`, target centre pièce, position initiale plus proche (3×4.5 m)
4. **Plafond** déjà quasi transparent → le **cacher en édition**

### Phase B — Murs intelligents *(P0, ~1 session)*
1. Toggle UI : **Murs : Plein | Coupés | Masqués** (défaut = **Coupés** mi-hauteur ~1,1 m)
2. Option auto : mur(s) **face caméra** en opacity 0.15–0.25 (pattern Sims)
3. Garder porte / fenêtre / rideaux lisibles même en mode coupé

### Phase C — Contrôles placement *(P0, déjà partiel)*
1. ✅ Orbit / Poser / Échap / Annuler (Task 11)
2. Clic droit ou molette = toujours orbit (même en mode Poser) — *améliore encore*
3. Astuce UI : « Échap pour naviguer »

### Phase D — Français *(P0, immédiat)*
1. Traduire TopBar, catalogue (catégories), barre de sélection, confirms, warnings
2. Titre produit : **Chambre de Louise** (ou **Déco chambre**)
3. Presets : **Vide** / **Chambre Louise**

### Phase E — Preset & contenu *(P1, Tasks 16+)*
1. Layout **Chambre Louise** fidèle photos
2. Affiner silhouettes meubles vs refs
3. Optionnel : vue **plan 2D** simplifiée

### Phase F — Polish *(P2)*
1. Ombres douces au sol
2. Lames de parquet (texture simple)
3. Hint première visite (3 bulles)

---

## Critères de succès

- [ ] La pièce ne « flotte » plus (socle + fond atelier visibles)
- [ ] On place un lit sans être bloqué par un mur opaque
- [ ] Caméra stable type dollhouse (pas de retournement sous le sol)
- [ ] Toute l’UI en français
- [ ] Un enfant / parent comprend Pose → Échap → Tourner en < 30 s

## Ordre d’exécution proposé

1. **Phase D** — FR (rapide, immédiat)
2. **Phase A** — socle + caméra + fond
3. **Phase B** — murs coupés / masqués
4. **Phase C** raffinement + **Phase E** preset Louise
