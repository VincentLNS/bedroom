# Bedroom Decorator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a browser 3D sandbox where a player orbits an empty girl’s bedroom and furnishes it from a catalogue with grid snap, collision, autosave, and export/import.

**Architecture:** Vite + React 19 + TypeScript shell; R3F/drei canvas for the room; Zustand for layout state; pure TS modules for grid/collision/catalog/persist (unit-tested); pastel primitive meshes first, GLTF hooks later.

**Tech Stack:** Vite, React 19, TypeScript, three, @react-three/fiber, @react-three/drei, zustand, Vitest

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-20-bedroom-decorator-design.md`
- Platforms: desktop browser primary; tablet touch secondary; not phone-first
- Camera: orbit only
- Placement: floor-only, grid **0.5 m** cells, rotations **0 | 90 | 180 | 270**, footprint collision + door clearance
- Look: stylized pastel, rounded, toy-like
- Persist: `localStorage` key `bedroom-layout-v1`; export/import `BedroomFileV1`
- Out of v1: story/NPC/score, wall paint, wall hangings, surface stacking, physics, accounts, multiplayer
- Content: ship loop + ≥12 items; path to 40+ without API redesign
- **Louise amendment (user C):** room **3.0 × 4.5 m**; catalogue photo-matched to `docs/references/louise-room/`; presets **Empty** + **Chambre Louise** — see `docs/superpowers/specs/2026-07-20-louise-room-amendment.md`
- Tests: Vitest for pure logic; manual browser check for R3F visuals
- Commits: small, frequent; conventional `feat:` / `test:` / `chore:` messages

---

## File Structure

```
bedroom/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vitest.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── catalog/
│   │   ├── types.ts
│   │   ├── items.ts
│   │   └── index.ts
│   ├── placement/
│   │   ├── grid.ts
│   │   ├── collision.ts
│   │   └── index.ts
│   ├── persist/
│   │   ├── schema.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── store/
│   │   └── roomStore.ts
│   ├── room/
│   │   ├── constants.ts
│   │   ├── Room.tsx
│   │   ├── FloorGrid.tsx
│   │   └── lighting.tsx
│   ├── furniture/
│   │   ├── PrimitiveFurniture.tsx
│   │   ├── PlacedFurniture.tsx
│   │   └── GhostPreview.tsx
│   ├── scene/
│   │   ├── BedroomScene.tsx
│   │   └── PlacementController.tsx
│   └── ui/
│       ├── CataloguePanel.tsx
│       ├── TopBar.tsx
│       └── SelectionToolbar.tsx
└── src/__tests__/
    ├── grid.test.ts
    ├── collision.test.ts
    ├── catalog.test.ts
    ├── persist.test.ts
    └── roomStore.test.ts
```

---

### Task 1: Scaffold Vite app + Vitest

**Files:**
- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`, `src/vite-env.d.ts`
- Test: smoke via `npm test` (empty suite OK) + `npm run build`

**Interfaces:**
- Consumes: none
- Produces: runnable Vite React-TS app; `npm run dev`, `npm test`, `npm run build`

- [ ] **Step 1: Scaffold project in repo root**

Run from `/Users/vincent.lasnier/Documents/GitHub/bedroom` (keep existing `docs/`):

```bash
npm create vite@latest . -- --template react-ts
```

If the tool refuses non-empty dir, create files manually with the same Vite React-TS layout and keep `docs/`.

- [ ] **Step 2: Install runtime + test deps**

```bash
npm install three @react-three/fiber @react-three/drei zustand
npm install -D vitest @types/three jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Minimal App shell**

Replace `src/App.tsx` with:

```tsx
export default function App() {
  return (
    <div className="app">
      <h1>Bedroom</h1>
      <p>Decorator sandbox</p>
    </div>
  )
}
```

Replace `src/index.css` with a full-viewport reset (pastel page bg `#f7efe8`).

- [ ] **Step 5: Verify scaffold**

```bash
npm test
npm run build
```

Expected: tests pass (0 or placeholder); build succeeds.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts vitest.config.ts tsconfig*.json index.html src
git commit -m "chore: scaffold Vite React TS app with Vitest and R3F deps"
```

---

### Task 2: Catalog types + starter items

**Files:**
- Create: `src/catalog/types.ts`, `src/catalog/items.ts`, `src/catalog/index.ts`
- Test: `src/__tests__/catalog.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `CatalogCategory = 'beds' | 'desks' | 'storage' | 'toys' | 'soft' | 'decor'`
  - `CatalogItem` as in spec
  - `CATALOG: CatalogItem[]`
  - `getCatalogItem(id: string): CatalogItem | undefined`
  - `listByCategory(category: CatalogCategory): CatalogItem[]`

- [ ] **Step 1: Write failing catalog tests**

Create `src/__tests__/catalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { CATALOG, getCatalogItem, listByCategory } from '../catalog'

describe('catalog', () => {
  it('has at least 12 items with unique ids', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(12)
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getCatalogItem returns item by id', () => {
    const first = CATALOG[0]
    expect(getCatalogItem(first.id)).toEqual(first)
    expect(getCatalogItem('missing')).toBeUndefined()
  })

  it('listByCategory filters', () => {
    const beds = listByCategory('beds')
    expect(beds.length).toBeGreaterThan(0)
    expect(beds.every((i) => i.category === 'beds')).toBe(true)
  })

  it('every item has positive integer footprint', () => {
    for (const item of CATALOG) {
      expect(Number.isInteger(item.footprint[0])).toBe(true)
      expect(Number.isInteger(item.footprint[1])).toBe(true)
      expect(item.footprint[0]).toBeGreaterThan(0)
      expect(item.footprint[1]).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- src/__tests__/catalog.test.ts
```

Expected: FAIL (module not found)

- [ ] **Step 3: Implement catalog**

`src/catalog/types.ts`:

```ts
export type CatalogCategory =
  | 'beds'
  | 'desks'
  | 'storage'
  | 'toys'
  | 'soft'
  | 'decor'

export type CatalogVisual =
  | { type: 'primitive'; tint?: string; kind: PrimitiveKind }
  | { type: 'gltf'; src: string; tint?: string }

export type PrimitiveKind =
  | 'bed'
  | 'desk'
  | 'chair'
  | 'shelf'
  | 'chest'
  | 'rug'
  | 'lamp'
  | 'plant'
  | 'toy'
  | 'beanbag'
  | 'mirror'
  | 'blocks'

export type CatalogItem = {
  id: string
  name: string
  category: CatalogCategory
  footprint: [widthCells: number, depthCells: number]
  visual: CatalogVisual
}
```

`src/catalog/items.ts` — define **≥12** pastel primitive items covering all six categories (exact list OK to tweak names):

| id | category | footprint |
|----|----------|-----------|
| bed-twin | beds | [2, 4] |
| bed-canopy | beds | [2, 4] |
| desk-simple | desks | [2, 1] |
| chair-study | desks | [1, 1] |
| lamp-floor | desks | [1, 1] |
| shelf-low | storage | [2, 1] |
| chest-toys | storage | [2, 1] |
| wardrobe-tall | storage | [2, 1] |
| toy-blocks | toys | [1, 1] |
| toy-dollhouse | toys | [2, 2] |
| rug-round | soft | [2, 2] |
| beanbag-pink | soft | [2, 2] |
| plant-pot | decor | [1, 1] |
| mirror-stand | decor | [1, 1] |

Each `visual: { type: 'primitive', kind: ..., tint: '#hex' }`.

`src/catalog/index.ts`:

```ts
export * from './types'
export { CATALOG } from './items'
import { CATALOG } from './items'
import type { CatalogCategory, CatalogItem } from './types'

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id)
}

export function listByCategory(category: CatalogCategory): CatalogItem[] {
  return CATALOG.filter((item) => item.category === category)
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/__tests__/catalog.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/catalog src/__tests__/catalog.test.ts
git commit -m "feat: add furniture catalog types and starter items"
```

---

### Task 3: Room constants + grid math

**Files:**
- Create: `src/room/constants.ts`, `src/placement/grid.ts`, `src/placement/index.ts`
- Test: `src/__tests__/grid.test.ts`

**Interfaces:**
- Consumes: none
- Produces:
  - `CELL_SIZE = 0.5`
  - `ROOM_WIDTH_M = 4`, `ROOM_DEPTH_M = 5`
  - `GRID_COLS = 8`, `GRID_ROWS = 10`
  - `worldToCell(x: number, z: number): { cx: number; cz: number }`
  - `cellToWorld(cx: number, cz: number): { x: number; z: number }` (cell center)
  - `footprintCells(cx, cz, rot, footprint): { cx: number; cz: number }[]`
  - `inBounds(cells): boolean`

Room origin: floor centered at `(0, 0, 0)`; X ∈ [-2, 2], Z ∈ [-2.5, 2.5]. Cell `(0,0)` = southwest corner cell whose min corner is `(-2, -2.5)`.

- [ ] **Step 1: Write failing grid tests**

```ts
import { describe, it, expect } from 'vitest'
import {
  worldToCell,
  cellToWorld,
  footprintCells,
  inBounds,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from '../placement'

describe('grid', () => {
  it('exposes 0.5m cells on 4x5 room', () => {
    expect(CELL_SIZE).toBe(0.5)
    expect(GRID_COLS).toBe(8)
    expect(GRID_ROWS).toBe(10)
  })

  it('worldToCell snaps to integers', () => {
    expect(worldToCell(-2 + 0.1, -2.5 + 0.1)).toEqual({ cx: 0, cz: 0 })
    expect(worldToCell(0, 0)).toEqual({ cx: 4, cz: 5 })
  })

  it('cellToWorld returns cell centers', () => {
    const { x, z } = cellToWorld(0, 0)
    expect(x).toBeCloseTo(-2 + CELL_SIZE / 2)
    expect(z).toBeCloseTo(-2.5 + CELL_SIZE / 2)
  })

  it('footprintCells rotates 90 degrees', () => {
    const at0 = footprintCells(1, 1, 0, [2, 1])
    expect(at0).toHaveLength(2)
    const at90 = footprintCells(1, 1, 90, [2, 1])
    expect(at90).toHaveLength(2)
    expect(new Set(at90.map((c) => `${c.cx},${c.cz}`)).size).toBe(2)
  })

  it('inBounds rejects out of room', () => {
    expect(inBounds([{ cx: 0, cz: 0 }])).toBe(true)
    expect(inBounds([{ cx: -1, cz: 0 }])).toBe(false)
    expect(inBounds([{ cx: 8, cz: 0 }])).toBe(false)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- src/__tests__/grid.test.ts
```

- [ ] **Step 3: Implement constants + grid**

`src/room/constants.ts`:

```ts
export const CELL_SIZE = 0.5
export const ROOM_WIDTH_M = 4
export const ROOM_DEPTH_M = 5
export const ROOM_HEIGHT_M = 2.6
export const GRID_COLS = ROOM_WIDTH_M / CELL_SIZE // 8
export const GRID_ROWS = ROOM_DEPTH_M / CELL_SIZE // 10
export const ROOM_MIN_X = -ROOM_WIDTH_M / 2
export const ROOM_MIN_Z = -ROOM_DEPTH_M / 2
/** Door on -Z wall; clearance cells in front of door center */
export const DOOR_CLEARANCE: { cx: number; cz: number }[] = [
  { cx: 3, cz: 0 },
  { cx: 4, cz: 0 },
  { cx: 3, cz: 1 },
  { cx: 4, cz: 1 },
]
```

`src/placement/grid.ts` — implement `worldToCell`, `cellToWorld`, `footprintCells`, `inBounds` using the origin rules above. For rotation: treat footprint as width along +X and depth along +Z at rot 0; swap/offset for 90/180/270 so the **anchor cell** is the min-X/min-Z corner of the AABB after rotation (document this in a one-line comment).

`src/placement/index.ts` re-exports grid + later collision.

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- src/__tests__/grid.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/room/constants.ts src/placement src/__tests__/grid.test.ts
git commit -m "feat: add room constants and grid snap math"
```

---

### Task 4: Collision checks

**Files:**
- Create: `src/placement/collision.ts`
- Modify: `src/placement/index.ts`
- Test: `src/__tests__/collision.test.ts`

**Interfaces:**
- Consumes: `footprintCells`, `inBounds`, `DOOR_CLEARANCE`
- Produces:
  - `type PlacedFootprint = { instanceId: string; cells: { cx: number; cz: number }[] }`
  - `canPlace(cells, occupied: PlacedFootprint[], ignoreInstanceId?: string): boolean`

- [ ] **Step 1: Write failing collision tests**

```ts
import { describe, it, expect } from 'vitest'
import { canPlace } from '../placement'
import { footprintCells } from '../placement'
import { DOOR_CLEARANCE } from '../room/constants'

describe('canPlace', () => {
  it('allows empty in-bounds footprint', () => {
    const cells = footprintCells(2, 2, 0, [1, 1])
    expect(canPlace(cells, [])).toBe(true)
  })

  it('rejects overlap with another item', () => {
    const a = footprintCells(2, 2, 0, [2, 2])
    const b = footprintCells(2, 2, 0, [1, 1])
    expect(canPlace(b, [{ instanceId: 'a', cells: a }])).toBe(false)
  })

  it('ignores self when moving', () => {
    const cells = footprintCells(2, 2, 0, [2, 2])
    expect(
      canPlace(cells, [{ instanceId: 'a', cells }], 'a'),
    ).toBe(true)
  })

  it('rejects door clearance cells', () => {
    expect(canPlace(DOOR_CLEARANCE.slice(0, 1), [])).toBe(false)
  })

  it('rejects out of bounds', () => {
    expect(canPlace([{ cx: -1, cz: 0 }], [])).toBe(false)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- src/__tests__/collision.test.ts
```

- [ ] **Step 3: Implement `canPlace`**

```ts
import { DOOR_CLEARANCE } from '../room/constants'
import { inBounds } from './grid'

export type Cell = { cx: number; cz: number }
export type PlacedFootprint = { instanceId: string; cells: Cell[] }

const doorSet = new Set(DOOR_CLEARANCE.map((c) => `${c.cx},${c.cz}`))

export function canPlace(
  cells: Cell[],
  occupied: PlacedFootprint[],
  ignoreInstanceId?: string,
): boolean {
  if (!inBounds(cells)) return false
  for (const c of cells) {
    if (doorSet.has(`${c.cx},${c.cz}`)) return false
  }
  const blocked = new Set<string>()
  for (const item of occupied) {
    if (item.instanceId === ignoreInstanceId) continue
    for (const c of item.cells) blocked.add(`${c.cx},${c.cz}`)
  }
  return cells.every((c) => !blocked.has(`${c.cx},${c.cz}`))
}
```

Export from `src/placement/index.ts`.

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- src/__tests__/collision.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/placement src/__tests__/collision.test.ts src/room/constants.ts
git commit -m "feat: add footprint collision and door clearance"
```

---

### Task 5: Zustand room store

**Files:**
- Create: `src/store/roomStore.ts`
- Test: `src/__tests__/roomStore.test.ts`

**Interfaces:**
- Consumes: `getCatalogItem`, `footprintCells`, `canPlace`
- Produces store with:
  - `items: PlacedItem[]` where `PlacedItem = { instanceId, catalogId, cx, cz, rot }`
  - `selectedId: string | null`
  - `mode: 'orbit' | 'place' | 'edit'`
  - `pendingCatalogId: string | null`
  - `place(catalogId, cx, cz, rot): boolean`
  - `move(instanceId, cx, cz): boolean`
  - `rotateSelected(): boolean`
  - `deleteSelected(): void`
  - `select(id: string | null): void`
  - `armPlace(catalogId: string): void`
  - `clearPending(): void`
  - `clearRoom(): void`
  - `replaceLayout(items: PlacedItem[]): void`
  - `getOccupied(): PlacedFootprint[]`

`rot` type: `0 | 90 | 180 | 270`. Generate `instanceId` with `crypto.randomUUID()`.

- [ ] **Step 1: Write failing store tests**

Create `src/__tests__/roomStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useRoomStore } from '../store/roomStore'

describe('roomStore', () => {
  beforeEach(() => {
    useRoomStore.getState().clearRoom()
    useRoomStore.getState().clearPending()
    useRoomStore.getState().select(null)
  })

  it('places an item when free', () => {
    const ok = useRoomStore.getState().place('bed-twin', 2, 3, 0)
    expect(ok).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().items[0].catalogId).toBe('bed-twin')
  })

  it('rejects overlapping place', () => {
    expect(useRoomStore.getState().place('bed-twin', 2, 3, 0)).toBe(true)
    expect(useRoomStore.getState().place('rug-round', 2, 3, 0)).toBe(false)
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('rotates selected by 90 degrees', () => {
    useRoomStore.getState().place('chair-study', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    expect(useRoomStore.getState().rotateSelected()).toBe(true)
    expect(useRoomStore.getState().items[0].rot).toBe(90)
  })

  it('deletes selected', () => {
    useRoomStore.getState().place('plant-pot', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(0)
    expect(useRoomStore.getState().selectedId).toBeNull()
  })

  it('moves selected ignoring self collision', () => {
    useRoomStore.getState().place('plant-pot', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    expect(useRoomStore.getState().move(id, 6, 5)).toBe(true)
    expect(useRoomStore.getState().items[0].cx).toBe(6)
  })

  it('clearRoom empties items', () => {
    useRoomStore.getState().place('plant-pot', 5, 5, 0)
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().items).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- src/__tests__/roomStore.test.ts
```

- [ ] **Step 3: Implement `roomStore.ts` with Zustand**

Use `create` from `zustand`. All mutations that change `items` go through `canPlace`. `rotateSelected` tries current cell with `rot = ((rot + 90) % 360) as 0 | 90 | 180 | 270`; if invalid, no-op return false.

- [ ] **Step 4: Run — expect PASS**

```bash
npm test -- src/__tests__/roomStore.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/store src/__tests__/roomStore.test.ts
git commit -m "feat: add zustand room store for place/move/rotate/delete"
```

---

### Task 6: Empty room scene + orbit

**Files:**
- Create: `src/room/Room.tsx`, `src/room/FloorGrid.tsx`, `src/room/lighting.tsx`, `src/scene/BedroomScene.tsx`
- Modify: `src/App.tsx`, `src/App.css`, `src/index.css`

**Interfaces:**
- Consumes: room constants
- Produces: full-viewport canvas with pastel room, door opening on −Z, window on +Z, orbit controls, visible floor grid

- [ ] **Step 1: Implement `Room.tsx`**

Build box-room from planes/boxes:
- Floor: cream (`#f3e6d8`)
- Walls: pastel (`#f2d6e4` / `#e8f0f7`)
- Door: hole or darker inset on −Z wall center (width ~1 m)
- Window: emissive/light panel on +Z wall
- Skip solid ceiling or use very transparent plane so orbit-from-above stays readable

- [ ] **Step 2: Implement `FloorGrid.tsx`**

Draw grid lines for `GRID_COLS` × `GRID_ROWS` on the floor (drei `Grid` or line segments). Mark door clearance cells with a subtle warmer tint.

- [ ] **Step 3: Implement `lighting.tsx` + `BedroomScene.tsx`**

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Room } from '../room/Room'
import { FloorGrid } from '../room/FloorGrid'
import { SceneLights } from '../room/lighting'

export function BedroomScene() {
  return (
    <Canvas camera={{ position: [4, 5, 6], fov: 45 }}>
      <color attach="background" args={['#f7efe8']} />
      <SceneLights />
      <Room />
      <FloorGrid />
      <OrbitControls makeDefault target={[0, 0.8, 0]} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  )
}
```

- [ ] **Step 4: Wire App**

`App.tsx` full-viewport: `#root` and `.app` height 100%; `BedroomScene` fills remaining space under a thin title bar placeholder.

- [ ] **Step 5: Manual verify**

```bash
npm run dev
```

Expected: orbit room; see door + window + grid; no furniture yet.

- [ ] **Step 6: Commit**

```bash
git add src/room src/scene src/App.tsx src/App.css src/index.css
git commit -m "feat: add empty pastel bedroom scene with orbit camera"
```

---

### Task 7: Primitive meshes + place from click

**Files:**
- Create: `src/furniture/PrimitiveFurniture.tsx`, `src/furniture/GhostPreview.tsx`, `src/furniture/PlacedFurniture.tsx`, `src/scene/PlacementController.tsx`
- Modify: `src/scene/BedroomScene.tsx`, `src/store/roomStore.ts` (if needed)

**Interfaces:**
- Consumes: store `place`, `pendingCatalogId`, `getOccupied`, catalog visuals, grid helpers
- Produces: click floor → place pending item; ghost follows pointer with valid/invalid tint

- [ ] **Step 1: `PrimitiveFurniture`**

Map `PrimitiveKind` → simple grouped meshes (rounded boxes via `Box` + slight bevel look with scaled children). Accept `tint`, `footprint` for sizing in meters (`cells * CELL_SIZE`).

- [ ] **Step 2: `GhostPreview`**

Read pointer raycast against floor plane `y=0`. Convert hit → `worldToCell` → `footprintCells` → `canPlace`. Render translucent primitive at `cellToWorld`; color `#9fe6c3` valid / `#f08080` invalid.

- [ ] **Step 3: `PlacementController`**

On pointer down on floor when `mode === 'place'` and `pendingCatalogId`: if `canPlace`, call `place(...)`. Disable OrbitControls while placing if needed (`enableRotate={!placing}` pattern) — or rely on mode toggle from UI in Task 8.

- [ ] **Step 4: `PlacedFurniture`**

Map `items` from store → meshes at cell centers with Y-rot in radians.

- [ ] **Step 5: Manual verify**

Temporarily hardcode in a tiny debug button or `useEffect`: `armPlace('bed-twin')`, then click floor. Expect bed snaps; second overlapping place rejected.

- [ ] **Step 6: Commit**

```bash
git add src/furniture src/scene
git commit -m "feat: place primitive furniture with ghost snap preview"
```

---

### Task 8: Catalogue UI + top bar chrome

**Files:**
- Create: `src/ui/CataloguePanel.tsx`, `src/ui/TopBar.tsx`
- Modify: `src/App.tsx`, `src/App.css`

**Interfaces:**
- Consumes: `CATALOG`, `listByCategory`, store `armPlace`, `clearPending`, `mode`, `clearRoom`
- Produces: category tabs + cards; selecting a card arms place mode; Clear Room button

- [ ] **Step 1: `CataloguePanel`**

Desktop: left sidebar (~280px). Tablet CSS: bottom sheet (`@media (max-width: 900px)`). Tabs for each `CatalogCategory`. Cards show `name` + swatch from `tint`. Click card → `armPlace(id)`.

- [ ] **Step 2: `TopBar`**

Buttons: Clear room (confirm via `window.confirm`), and placeholders disabled for Export/Import until Task 10.

- [ ] **Step 3: Layout App**

```
┌──────────────┬────────────────────┐
│ TopBar                         │
├──────────────┼────────────────────┤
│ Catalogue    │ Canvas             │
│              │                    │
└──────────────┴────────────────────┘
```

- [ ] **Step 4: Manual verify**

Pick item from UI → ghost → place several categories.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/App.tsx src/App.css
git commit -m "feat: add catalogue panel and top bar chrome"
```

---

### Task 9: Select, rotate, delete, drag-move

**Files:**
- Create: `src/ui/SelectionToolbar.tsx`
- Modify: `src/furniture/PlacedFurniture.tsx`, `src/scene/PlacementController.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: `select`, `rotateSelected`, `deleteSelected`, `move`, `selectedId`
- Produces: click item → select + outline; toolbar rotate/delete; drag selected on floor re-snaps

- [ ] **Step 1: Selection on mesh click**

`stopPropagation` on furniture click → `select(instanceId)` → `mode = 'edit'`. Visual: mild emissive or `Outlines` from drei on selected.

- [ ] **Step 2: `SelectionToolbar`**

Fixed near bottom-center when `selectedId`: Rotate / Delete. Wire to store.

- [ ] **Step 3: Drag move**

Pointer down on selected + drag on floor → preview cells with `canPlace(..., selectedId)` → pointer up commits `move` or reverts.

- [ ] **Step 4: Click empty floor in edit mode clears selection** (and does not place unless pending).

- [ ] **Step 5: Manual verify**

Place two items; select; rotate; drag; delete; confirm collision blocks bad moves.

- [ ] **Step 6: Commit**

```bash
git add src/ui/SelectionToolbar.tsx src/furniture src/scene src/App.tsx
git commit -m "feat: select rotate delete and drag-move furniture"
```

---

### Task 10: Persist autosave + export/import

**Files:**
- Create: `src/persist/schema.ts`, `src/persist/storage.ts`, `src/persist/index.ts`
- Modify: `src/store/roomStore.ts`, `src/ui/TopBar.tsx`, `src/main.tsx` or `App.tsx`
- Test: `src/__tests__/persist.test.ts`

**Interfaces:**
- Consumes: `PlacedItem[]`
- Produces:
  - `BedroomFileV1` type (`version: 1`, `roomId: 'girl-bedroom-v1'`, `items`)
  - `serializeLayout(items): BedroomFileV1`
  - `parseLayout(data: unknown): { ok: true; file: BedroomFileV1 } | { ok: false; error: string }`
  - `saveToLocalStorage(file)` / `loadFromLocalStorage(): BedroomFileV1 | null`
  - `downloadBedroomFile(file)` / `readBedroomFile(file: File): Promise<...>`

Unknown `catalogId`: filter out on `replaceLayout` and surface a `console.warn` or small banner string in store `importWarnings: string[]`.

- [ ] **Step 1: Write failing persist tests**

Create `src/__tests__/persist.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseLayout, serializeLayout } from '../persist'

describe('persist', () => {
  it('round-trips a layout', () => {
    const file = serializeLayout([
      {
        instanceId: 'a',
        catalogId: 'bed-twin',
        cx: 2,
        cz: 3,
        rot: 90,
      },
    ])
    expect(file.version).toBe(1)
    expect(file.roomId).toBe('girl-bedroom-v1')
    expect(file.items[0]).toEqual({
      instanceId: 'a',
      catalogId: 'bed-twin',
      x: 2,
      z: 3,
      rot: 90,
    })
    const parsed = parseLayout(file)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.file.items[0].x).toBe(2)
    }
  })

  it('rejects wrong version', () => {
    const parsed = parseLayout({
      version: 99,
      roomId: 'girl-bedroom-v1',
      items: [],
    })
    expect(parsed.ok).toBe(false)
  })

  it('rejects non-objects', () => {
    expect(parseLayout(null).ok).toBe(false)
    expect(parseLayout('nope').ok).toBe(false)
  })
})
```

- [ ] **Step 2: Implement schema + storage**

`localStorage` key exactly `bedroom-layout-v1`.

Map runtime `cx`/`cz` ↔ file `x`/`z` in serialize/parse.

Debounce 300ms in store subscription (`subscribe` in `App` mount) writing serialized layout.

On boot: load localStorage → `replaceLayout`.

Unknown `catalogId` on import: skip those items; push message into store `importWarnings: string[]`.

- [ ] **Step 3: Wire Export / Import in TopBar**

Export: build blob `application/json`, download `my-room.bedroom.json`.  
Import: `<input type="file" accept=".json,.bedroom.json,application/json">` → parse → confirm → replace.

- [ ] **Step 4: Run unit tests + manual refresh test**

```bash
npm test -- src/__tests__/persist.test.ts
```

Manual: place items → refresh → still there; export → clear → import → restored.

- [ ] **Step 5: Commit**

```bash
git add src/persist src/store src/ui/TopBar.tsx src/App.tsx src/__tests__/persist.test.ts
git commit -m "feat: autosave layout and export/import bedroom JSON"
```

---

### Task 11: Touch / tablet polish

**Files:**
- Modify: `src/ui/CataloguePanel.tsx`, `src/App.css`, `src/scene/BedroomScene.tsx`, `src/ui/TopBar.tsx`

**Interfaces:**
- Consumes: store `mode`
- Produces: usable tablet UX with mode toggle Orbit | Place

- [ ] **Step 1: Mode toggle in TopBar**

Segmented control: Orbit / Place. When Orbit: `pendingCatalogId` cleared, OrbitControls fully enabled. When Place: orbit rotate disabled (pan/zoom optional), catalogue arming works.

- [ ] **Step 2: Touch targets**

Min 44px buttons; catalogue cards larger on `@media (pointer: coarse)`.

- [ ] **Step 3: Bottom sheet catalogue on narrow widths**

Already sketched in Task 8 — verify drag-scroll inside sheet does not move camera (stopPropagation on panel).

- [ ] **Step 4: Manual verify on tablet or Chrome device mode**

Place + orbit without fighting; select toolbar reachable.

- [ ] **Step 5: Commit**

```bash
git add src/ui src/App.css src/scene/BedroomScene.tsx
git commit -m "feat: tablet mode toggle and touch-friendly chrome"
```

---

### Task 12: Catalogue expansion path (12 → 20+ toward 40)

**Files:**
- Modify: `src/catalog/items.ts`, `src/furniture/PrimitiveFurniture.tsx`
- Optional create: `public/models/` + gltf entries when assets exist
- Test: update `catalog.test.ts` count if raising minimum

**Interfaces:**
- Consumes: existing `CatalogItem` / `PrimitiveKind`
- Produces: ≥20 items in-repo; documented path to 40+

- [ ] **Step 1: Add more primitives**

Extend `PrimitiveKind` only if needed. Add items until **≥20** across categories (beds/desks/toys/storage/soft/decor). Keep footprints integer.

- [ ] **Step 2: Optional first GLTF**

If a pastel-friendly `.glb` is available under `public/models/`, add one `visual: { type: 'gltf', src: '/models/....glb' }` and load via `useGLTF` in a `GltfFurniture.tsx`. Otherwise skip — do not block on art.

- [ ] **Step 3: Document remaining slots**

Add short comment block at bottom of `items.ts`:

```ts
// Target 40+: remaining ~N slots — prefer primitives; hero GLTFs for canopy bed, dollhouse, wardrobe.
```

- [ ] **Step 4: Run full test suite + build**

```bash
npm test
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/catalog src/furniture src/__tests__/catalog.test.ts public/models 2>/dev/null
git commit -m "feat: expand furniture catalogue toward 40-item target"
```

---

### Task 13: Final acceptance pass

**Files:**
- Modify: none required (fix bugs only)
- Verify against spec success criteria

- [ ] **Step 1: Checklist (manual)**

- [ ] Orbit empty room with door + window
- [ ] Place / move / rotate / delete from catalogue (≥12 items)
- [ ] Grid snap + collision + door clearance
- [ ] Autosave survives refresh
- [ ] Export + import round-trip
- [ ] Desktop + tablet-sized layout usable

- [ ] **Step 2: Fix any P0 bugs found; commit fixes individually**

- [ ] **Step 3: Final commit if polish landed**

```bash
git commit -m "fix: acceptance polish for bedroom decorator v1"
```

---

### Task 14: Resize room to Louise proportions

**Files:**
- Modify: `src/room/constants.ts`, `src/room/Room.tsx`, `src/room/FloorGrid.tsx`, grid/collision tests if they hardcode 8×10
- Spec: `docs/superpowers/specs/2026-07-20-louise-room-amendment.md`

**Interfaces:**
- Produces: `ROOM_WIDTH_M = 3`, `ROOM_DEPTH_M = 4.5`, `GRID_COLS = 6`, `GRID_ROWS = 9`, updated `DOOR_CLEARANCE` for 6-wide grid; dusty-rose curtains + paper lantern as room props

- [ ] **Step 1: Update constants + fix tests that assume 8×10 / 4×5**
- [ ] **Step 2: Update Room geometry (narrow, curtains, lantern)**
- [ ] **Step 3: `npm test` + `npm run build`**
- [ ] **Step 4: Commit** `feat: resize bedroom to Louise proportions`

---

### Task 15: Louise catalogue items (photo-matched primitives)

**Files:**
- Modify: `src/catalog/types.ts`, `src/catalog/items.ts`, `src/furniture/PrimitiveFurniture.tsx`
- Refs: `docs/references/louise-room/`
- Spec amendment inventory

**Interfaces:**
- Produces: ≥12 Louise hero items with distinct `PrimitiveKind`s / meshes matching photo silhouettes (bed-louise, desk-louise, dollhouse, trofast, wardrobe, hopscotch rug, etc.)

- [ ] **Step 1: Extend PrimitiveKind + meshes for Louise heroes**
- [ ] **Step 2: Add/replace catalog entries; keep ≥12; prefer Louise ids**
- [ ] **Step 3: Update catalog tests**
- [ ] **Step 4: Commit** `feat: add Louise photo-matched furniture catalogue`

---

### Task 16: Preset Empty + Chambre Louise

**Files:**
- Create: `src/presets/louise.ts`
- Modify: `src/ui/TopBar.tsx`, store `replaceLayout` / `clearRoom`

**Interfaces:**
- Produces: `LOUISE_LAYOUT: PlacedItem[]` approximating photo layout on 6×9 grid; TopBar buttons **Vide** / **Chambre Louise**

- [ ] **Step 1: Author louise preset positions from photo layout**
- [ ] **Step 2: Wire TopBar preset buttons**
- [ ] **Step 3: Manual compare vs references**
- [ ] **Step 4: Commit** `feat: add Empty and Chambre Louise presets`

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Empty room door + window | 6 |
| Catalogue 40+ path / ≥12 ship | 2, 12, 15 |
| Place/move/rotate/delete | 7, 9 |
| Grid 0.5 + collision + door zone | 3, 4, 14 |
| Desktop + tablet | 8, 11 |
| Autosave + export/import | 10 |
| Pastel stylized | 6, 7 |
| Orbit camera | 6 |
| R3F + Zustand stack | 1, 5, 6 |
| No wall hangings / stacking / story | wall art may bake into Room (Louise amendment) |
| Mix primitives + hero GLTF | 7, 12, 15 |
| Louise proportions 3×4.5 + presets C | 14, 15, 16 |

## Type consistency notes

- Grid uses `cx` / `cz` integers everywhere (store + persist + collision).
- Persist schema uses `x` / `z` as in spec — **map** `x←cx`, `z←cz` in `serializeLayout` / `parseLayout` so on-disk matches spec field names while runtime stays `cx`/`cz`.
- `rot` always `0 | 90 | 180 | 270`.
- `roomId` always `'girl-bedroom-v1'`; storage key always `bedroom-layout-v1`.
