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
 * Cuisine rose — dinette complète (frigo, plaque, évier, bar).
 * Clearance porte cx 2–3, cz 0–1.
 *
 * Orientation Kenney : façade = −Z local
 * → rot 180 mur porte (−Z), rot 270 mur −X.
 */
const CUISINE_SLOTS: Slot[] = [
  // Mur porte (−Z) — frigo + cuisinière (porte libre au centre)
  {
    id: 'cuisine-fridge',
    catalogId: 'fridge-tall-cream',
    cx: 0,
    cz: 0,
    rot: 180,
  },
  {
    id: 'cuisine-stove',
    catalogId: 'stove-electric-pink',
    cx: 5,
    cz: 0,
    rot: 180,
  },
  {
    id: 'cuisine-blender',
    catalogId: 'blender-toy',
    cx: 5,
    cz: 0,
    parentId: 'cuisine-stove',
  },

  // Mur −X — évier + meuble
  {
    id: 'cuisine-sink',
    catalogId: 'sink-kitchen-sky',
    cx: 0,
    cz: 4,
    rot: 270,
  },
  {
    id: 'cuisine-cabinet',
    catalogId: 'cabinet-drawer-kitchen',
    cx: 0,
    cz: 7,
    rot: 270,
  },
  {
    id: 'cuisine-micro',
    catalogId: 'microwave-toy',
    cx: 0,
    cz: 7,
    parentId: 'cuisine-cabinet',
  },

  // Îlot / bar + tabourets
  {
    id: 'cuisine-bar',
    catalogId: 'kitchen-bar-oak',
    cx: 3,
    cz: 5,
    rot: 0,
  },
  {
    id: 'cuisine-coffee',
    catalogId: 'coffee-machine-toy',
    cx: 3,
    cz: 5,
    parentId: 'cuisine-bar',
  },
  {
    id: 'cuisine-stool-a',
    catalogId: 'stool-square-yellow',
    cx: 3,
    cz: 4,
    rot: 180,
  },
  {
    id: 'cuisine-stool-b',
    catalogId: 'stool-wood',
    cx: 5,
    cz: 5,
    rot: 270,
  },

  // Tapis + table goûter
  { id: 'cuisine-rug', catalogId: 'rug-mint-large', cx: 4, cz: 7 },
  {
    id: 'cuisine-table',
    catalogId: 'table-dining-oak',
    cx: 4,
    cz: 8,
    rot: 0,
  },

  // Mur fenêtre (+Z)
  {
    id: 'cuisine-kitchen',
    catalogId: 'toy-kitchen-pink',
    cx: 1,
    cz: 10,
    rot: 180,
  },
  {
    id: 'cuisine-end',
    catalogId: 'kitchen-bar-end',
    cx: 4,
    cz: 10,
    rot: 180,
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
