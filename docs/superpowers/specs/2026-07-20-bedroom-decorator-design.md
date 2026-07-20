# Bedroom Decorator — Design Spec

**Date:** 2026-07-20  
**Status:** Approved for implementation planning  
**Working title:** Bedroom (little girl’s room furnishing sandbox)

## 1. Summary

Browser-based 3D sandbox: furnish an empty girl’s bedroom from a furniture catalogue. No scores, story, or missions. Player orbits the room, places items on a grid, saves locally, and can export/import layouts.

## 2. Goals & non-goals

### Goals

- Empty room with a door on one wall and a window on the opposite wall
- Catalogue of beds, desks, toys, storage, soft furnishings, decor (40+ items target)
- Place, move, rotate (90°), delete furniture
- Grid snap + footprint collision with walls and other items
- Desktop mouse + tablet touch
- Local autosave + export/import JSON
- Stylized pastel, rounded, toy-like look

### Non-goals (v1)

- Story, NPCs, scoring, challenges
- Wall paint / wallpaper editor
- Wall hangings
- Surface stacking (e.g. lamp on desk)
- Rigid-body physics beyond footprint collision
- Accounts, cloud sync, multiplayer
- Phone-first layout (phones may work poorly; not a target)

## 3. Target platforms

- **Primary:** desktop browser (mouse + keyboard)
- **Secondary:** tablet browser (touch)
- **Camera:** orbit (rotate, pan, zoom)

## 4. Architecture

```
React shell
├── Catalogue UI (categories, cards, selection tools)
├── R3F Canvas
│   ├── Room (walls, floor, door, window, optional ceiling)
│   ├── OrbitControls
│   ├── PlacedFurniture instances
│   └── Ghost preview + grid helpers
└── Zustand store
    ├── layout state
    ├── localStorage autosave
    └── export / import JSON
```

### Modules

| Module | Responsibility |
|--------|----------------|
| `catalog/` | Item definitions: id, name, category, footprint, visual |
| `room/` | Fixed empty room geometry and lighting |
| `placement/` | Raycast → grid snap → collision → commit |
| `store/` | Placed instances, selection, interaction mode |
| `persist/` | Autosave, export, import, schema versioning |

## 5. Stack

- Vite
- React 19 + TypeScript
- Three.js
- `@react-three/fiber` + `@react-three/drei`
- Zustand
- CSS (no heavy UI kit required for v1)

## 6. Core gameplay loop

1. Open catalogue → select item → ghost follows pointer
2. Ghost snaps to floor grid; valid = soft pastel tint, invalid = red tint
3. Click/tap empty valid cell → place instance
4. Click/tap placed item → select (outline)
5. Selection actions: rotate 90°, delete, drag to move (re-validate snap + collision)
6. Orbit: left-drag / one-finger rotate; scroll / pinch zoom; right-drag / two-finger pan
7. Touch conflict mitigation: explicit mode toggle and/or long-press to place (phase 7)

### Placement rules

- Floor-only placement in v1
- Grid cell size: 0.25–0.5 m (finalize in implementation; default **0.5 m**)
- Item footprint: integer width × depth in cells
- Rotation: 0° / 90° / 180° / 270° only
- Collision: walls + other footprints; keep a clear zone in front of the door
- No stacking

## 7. Room

- Size: **3.0 × 4.5 m** (narrow × long; door→window on long axis) — see Louise amendment
- Soft off-white walls, light wood floor
- Door on one short wall (−Z); window on the opposite short wall (+Z) with dusty-rose curtains
- Fixed paper lantern on ceiling; orbit-friendly framing; optional translucent ceiling
- No wallpaper or paint picker in v1 (Louise wall art may be baked into room/preset)
- **Amendment:** `docs/superpowers/specs/2026-07-20-louise-room-amendment.md` (preset **Chambre Louise** + empty mode)

## 8. Catalogue

### Categories (target ~40+ items)

| Category | Examples | Target count |
|----------|----------|--------------|
| Beds | twin, canopy, loft, daybed | ~6 |
| Desks & study | desks, chair, lamp, bookshelf | ~8 |
| Storage | dresser, wardrobe, toy chest, shelves | ~6 |
| Toys & play | dollhouse, stuffed animals, blocks, easel | ~10 |
| Soft / floor | rugs, beanbag, cushions | ~5 |
| Decor | plants, nightstand, mirror, small props | ~8 |

### Item definition

```ts
type CatalogItem = {
  id: string
  name: string
  category: 'beds' | 'desks' | 'storage' | 'toys' | 'soft' | 'decor'
  footprint: [widthCells: number, depthCells: number]
  visual:
    | { type: 'primitive'; tint?: string }
    | { type: 'gltf'; src: string; tint?: string }
}
```

### Asset strategy

- **Mix:** kit-bashed pastel primitives for volume + a few hero GLTF models
- Shared material language (pastel palette, soft roughness) so primitives and GLTFs feel coherent
- Content ship order: working loop + **~12 items**, then grow to **40+** without changing placement APIs

## 9. State & persistence

### Runtime state (Zustand)

- `items: { instanceId, catalogId, x, z, rot }[]`
- `selectedId: string | null`
- `mode: 'orbit' | 'place' | 'edit'`
- Optional: undo stack (last ~20 actions) — desirable, not a launch blocker

### Autosave

- Debounced writes to `localStorage` key `bedroom-layout-v1` on place / move / rotate / delete / clear / import

### Export / import

- Export downloads versioned `*.bedroom.json`
- Import via file picker; validate schema; confirm before replacing current layout

### Schema (v1)

```ts
type BedroomFileV1 = {
  version: 1
  roomId: 'girl-bedroom-v1'
  items: {
    instanceId: string
    catalogId: string
    x: number // grid cell X
    z: number // grid cell Z
    rot: 0 | 90 | 180 | 270
  }[]
}
```

Unknown `catalogId` on import: skip item and warn in UI (do not fail entire import).

## 10. UI chrome

- Catalogue panel: category tabs + item cards (left on desktop; bottom sheet on tablet)
- Top bar: clear room, export, import
- Selection toolbar: rotate 90°, delete
- Placement mode indicator when a catalogue item is armed
- No login or settings cloud

## 11. Build phases

1. Empty room + orbit camera + visible grid
2. Place one primitive with snap + collision
3. Catalogue UI + first ~12 items
4. Select / rotate / delete / drag-move
5. Autosave + export / import
6. Expand catalogue to 40+ (primitives + hero GLTFs)
7. Tablet polish (gesture modes, hit targets, bottom sheet)

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Touch: orbit vs place conflict | Mode toggle; long-press place; large hit targets |
| 40+ art cost | Primitive kit first; GLTF only for hero pieces; shared materials |
| GLTF style mismatch | Tint / material override pass; reject assets that break pastel look |
| Performance on mid tablets | Instancing where useful; modest poly budgets; bake simple materials |

## 13. Success criteria (v1 done)

- User can orbit an empty room with door + window
- User can place, move, rotate, and delete items from a catalogue of at least **12** items with grid snap and collision
- Layout survives refresh (autosave)
- User can export and re-import a layout file
- Usable on desktop and a tablet-sized touch browser
- Path exists to reach **40+** items without redesigning placement or save format
