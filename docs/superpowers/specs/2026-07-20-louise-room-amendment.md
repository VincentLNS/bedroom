# Amendment: Chambre Louise (reference room)

**Date:** 2026-07-20  
**Status:** Approved (user choice **C**)  
**Supersedes:** room size **4 × 5 m** and generic catalogue examples in the base design where they conflict.

## Decision

- **C:** Empty room mode **and** a loadable preset **« Chambre Louise »** that recreates the real bedroom from reference photos.
- Reference photos: `docs/references/louise-room/`
- Visual fidelity: **stylized likeness** (silhouette, palette, layout) — not photoreal textures.

## Room proportions (from photos)

Long narrow girl’s room; door and window on opposite short walls.

| Constant | New value | Notes |
|----------|-----------|--------|
| `ROOM_WIDTH_M` (X, short axis) | **3.0** | ~narrow width |
| `ROOM_DEPTH_M` (Z, door→window) | **4.5** | long axis |
| `CELL_SIZE` | **0.5** (unchanged) | → grid **6 × 9** |
| Door | −Z short wall | clearance updated for 6-wide grid |
| Window | +Z short wall | dark frame + dusty-rose curtains |
| Floor | light wood planks | |
| Walls | off-white | |
| Ceiling light | paper lantern (fixed room prop) | |

Layout axes (preset):

- Bed along **+X** long wall (right when facing window)
- Desk under window
- Trofast / dollhouse / play along **−X** wall
- Wardrobe + bookshelf near door wall

## Modes / presets

1. **Empty** — clear room (current sandbox)
2. **Chambre Louise** — `replaceLayout` with authored preset positions matching photo layout as closely as grid allows
3. Top bar (or catalogue chrome): buttons **Vide** / **Chambre Louise**

Preset file shape: same as `BedroomFileV1` items list (or in-repo `src/presets/louise.ts`).

## Catalogue — Louise inventory (target, stylized primitives first)

Priority order for modeling (hero pieces first):

### Beds
- `bed-louise` — white frame, dusty-rose under drawers, floral duvet
- plush `stitch-blue`, `angel-pink` (floor or bed-adjacent footprints as floor items v1)

### Desks & study
- `desk-louise` — white + pink drawers + small hutch
- `chair-swivel-white`
- `lamp-rattan-gold`
- `bookshelf-oak` (tall, books as baked color bands)

### Storage
- `wardrobe-oak` — 2 doors + 2 base drawers, round knobs
- `trofast-low` — wood frame + white bins
- `chest-lego-white` — long low white chest
- `basket-wicker-pompom`, `basket-wicker-small`, `basket-oval-pink`

### Toys & play
- `dollhouse-white-grey` — 3-storey white, grey roof/shutters
- `lego-camper`, `lego-castle-blue`, `lego-cluster` (simplified builds)
- `pirate-ship-black`
- `camper-van-pink`
- `treehouse-playset`
- `horses-schleich-set` (small tabletop → floor footprint v1)
- `doll-bunk-wood`

### Soft / floor
- `rug-hopscotch-pink`
- `curtain-pair-terracotta` — **fixed to window wall** as room prop OR catalogue wall-adjacent footprint along +Z
- `chair-rattan-child`

### Decor
- `lantern-paper` — room ceiling prop (not catalogue) **or** decor item
- `lightbox-louise`
- `birds-wall-pink` — v1: skip wall hangings per base non-goal **OR** allow as floor-leaning / shelf props until wall placement exists
- `frame-koala`, `art-tree`, `drawings-cluster` — same wall rule

**Wall hangings:** base design forbade wall hangings in v1. For Louise likeness, allow **wall-anchored decor** as a narrow exception: items with `placement: 'wall'` snap to wall cells (separate small task). If deferred, bake key wall props into `Room.tsx` for the Louise preset only.

## Implementation sequence (after core Tasks 8–11)

1. Resize room constants + door clearance + scene geometry
2. Replace/extend catalogue with Louise items (primitives matching photo colors)
3. Author `presets/louise.ts` layout
4. Top bar: Vide / Chambre Louise
5. Room fixed props: lantern, curtains, optional wall art baked into preset room
6. Grow remaining toys toward 40+ from inventory list

## Success criteria (amendment)

- Empty room uses **3.0 × 4.5 m** proportions
- Catalogue includes recognizable Louise hero set (≥12 photo-matched items)
- One click loads **Chambre Louise** preset; Clear / Vide returns to empty
- Side-by-side with references: layout and silhouettes readable as the same room
