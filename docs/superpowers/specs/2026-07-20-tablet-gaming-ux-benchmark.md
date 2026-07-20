# Benchmark UX & gaming tablette — Mini Déco / Chambre Louise

**Date :** 2026-07-20  
**Statut :** v2 livrée (P0 + P1 + P2) — scorecard rescorée  
**Cible produit :** bac à sable déco **jouable sur iPad / tablette Android** comme un petit jeu de construction.

---

## Scorecard (§3) — après sprint bench

| # | Axe | Avant | Après | Preuve |
|---|-----|-------|-------|--------|
| A | Intention tactile | 4 | **8** | 1 doigt = pose ; 2 doigts = caméra en Pose |
| B | Caméra 2 doigts | 5 | **9** | `touches.TWO` always-on ; long-press annule |
| C | Cibles & pouces | 6 | **8** | Dock bas, sheet peek/half/full, gros doigts |
| D | Catalogue jeu | 5 | **8** | Sheet + Favoris + Récents + Défis |
| E | Feedback placement | 6 | **8** | Pulse, son soft, vibrate, toasts |
| F | Sélection & édition | 5 | **8** | Dial rotation, Copie, Lock, confirm delete |
| G | Onboarding | 4 | **8** | Coach 3 bulles + défis |
| H | Accessibilité | 5 | **8** | Contraste fort, focus-visible, aria, gros doigts |
| I | Performance | 5 | **7** | Ombres high/low/off + DPR |
| J | Boucle fun | 6 | **8** | Photo PNG + 4 défis |
| K | Robustesse gestes | 4 | **8** | Undo pile, 2-finger tap, Annuler, long-press |
| L | Cohérence jouet | 7 | **8** | HUD place, tips FR tactile |

| Agrégat | Valeur |
|---------|--------|
| **Avant** | ≈ 5,2 / 10 |
| **Après** | **≈ 8,0 / 10** |
| **Cible v2** | ≥ 8,0 ✅ |

---

## Roadmap — statut livrables

### P0 ✅
| ID | Livrable | Statut |
|----|----------|--------|
| T1 | Two-finger camera always-on | ✅ |
| T2 | Undo pile + ↩ + 2-finger tap | ✅ |
| T3 | TopBar coarse + Plus… | ✅ |
| T4 | Tourner / Enlever pouce (ActionDock) | ✅ |
| T5 | First-run 3 bulles gestuelles | ✅ |

### P1 ✅
| ID | Livrable | Statut |
|----|----------|--------|
| T6 | Catalogue bottom sheet peek/half/full | ✅ |
| T7 | Snap pulse + son + vibrate | ✅ |
| T8 | Poignée rotation (dial 90°) | ✅ |
| T9 | Mode Photo + PNG | ✅ |
| T10 | Défis légers (4) | ✅ |

### P2 ✅
| ID | Livrable | Statut |
|----|----------|--------|
| T11 | Ombres quality toggle + less outdoor lights | ✅ |
| T12 | Favoris + récents | ✅ |
| T13 | Dupliquer + verrouiller (+ confirm delete) | ✅ |
| T14 | Aria / focus-visible / contraste fort | ✅ |
| T15 | Gros doigts (UI scale + hit 60px) | ✅ |

**Hors scope volontaire :** multi-select multi-objets (complexité > gain enfant).

---

## Critères de succès v2

- [x] Actions critiques sans clavier (pose, tourner, undo, annuler, recentrer, photo)
- [x] 2 doigts orbitent en Pose
- [x] Undo après chaque pose
- [x] Catalogue d’une main (sheet bas, iPad paysage)
- [x] Scorecard ≥ 8,0
- [ ] FPS ≥ 30 sur appareil réel (à mesurer ; toggle ombres prêt)

---

## Protocole de re-test (§7.3)

1. iPad Safari + Android Chrome  
2. Script north star : Louise → Stitch → Devon jardin → Photo → Undo  
3. Chronos Or sur ≥ 4 / 6 tâches  
4. Noter conflits orbit / pose  

*Document vivant — mis à jour 2026-07-20 après livraison bench complète.*
