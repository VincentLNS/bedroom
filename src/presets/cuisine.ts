import type { PlacedItem, Rotation } from '../store/roomStore'

type Slot = {
  id: string
  catalogId: string
  cx: number
  cz: number
  rot?: Rotation
  parentId?: string
}

/**
 * Cuisine rose — coin goûter / dinette.
 * Clearance porte cx 2–3, cz 0–1.
 */
const CUISINE_SLOTS: Slot[] = [
  // Mur porte (−Z)
  {
    id: 'cuisine-fridge',
    catalogId: 'fridge-toy-pink',
    cx: 0,
    cz: 0,
    rot: 180,
  },
  {
    id: 'cuisine-kitchen',
    catalogId: 'toy-kitchen-pink',
    cx: 5,
    cz: 0,
    rot: 180,
  },

  // Mur −X
  {
    id: 'cuisine-cabinet',
    catalogId: 'cabinet-drawer-cream',
    cx: 0,
    cz: 4,
    rot: 270,
  },
  {
    id: 'cuisine-micro',
    catalogId: 'microwave-toy',
    cx: 0,
    cz: 4,
    parentId: 'cuisine-cabinet',
  },

  // Centre
  { id: 'cuisine-rug', catalogId: 'rug-mint-large', cx: 3, cz: 4 },
  { id: 'cuisine-table', catalogId: 'table-round-kids', cx: 3, cz: 6 },
  {
    id: 'cuisine-stool-a',
    catalogId: 'stool-square-yellow',
    cx: 2,
    cz: 5,
    rot: 180,
  },
  {
    id: 'cuisine-stool-b',
    catalogId: 'stool-wood',
    cx: 5,
    cz: 6,
    rot: 270,
  },

  // Mur fenêtre (+Z)
  {
    id: 'cuisine-counter',
    catalogId: 'cabinet-drawer-table',
    cx: 1,
    cz: 10,
    rot: 180,
  },
  {
    id: 'cuisine-coffee',
    catalogId: 'coffee-machine-toy',
    cx: 1,
    cz: 10,
    parentId: 'cuisine-counter',
  },
  {
    id: 'cuisine-blender',
    catalogId: 'blender-toy',
    cx: 5,
    cz: 0,
    parentId: 'cuisine-kitchen',
  },
  { id: 'cuisine-plant', catalogId: 'plant-succulent', cx: 6, cz: 10 },
  { id: 'cuisine-basket', catalogId: 'basket-sky', cx: 7, cz: 8 },

  { id: 'cuisine-duck', catalogId: 'duck-yellow', cx: -2, cz: 7 },
]

export function createCuisineLayout(): PlacedItem[] {
  return CUISINE_SLOTS.map((slot) => ({
    instanceId: slot.id,
    catalogId: slot.catalogId,
    cx: slot.cx,
    cz: slot.cz,
    rot: slot.rot ?? 0,
    ...(slot.parentId ? { parentId: slot.parentId } : {}),
  }))
}
