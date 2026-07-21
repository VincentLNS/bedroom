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
 * Preset « Salon cosy » — même grille 8×11, ambiance salon / lecture.
 * Clearance porte cx 2–3, cz 0–1.
 */
const SALON_SLOTS: Slot[] = [
  { id: 'salon-sofa', catalogId: 'sofa-blush', cx: 0, cz: 4, rot: 90 },
  { id: 'salon-ottoman', catalogId: 'pouf-mint', cx: 3, cz: 6 },
  { id: 'salon-rug', catalogId: 'rug-round-yellow', cx: 3, cz: 4 },
  { id: 'salon-table', catalogId: 'coffee-table-oak', cx: 3, cz: 7 },
  { id: 'salon-lamp', catalogId: 'floor-lamp-cream', cx: 6, cz: 3 },
  { id: 'salon-plant', catalogId: 'plant-monstera', cx: 7, cz: 5 },
  { id: 'salon-bookshelf', catalogId: 'bookshelf-oak', cx: 0, cz: 0 },
  {
    id: 'salon-books',
    catalogId: 'books-stack-desk',
    cx: 0,
    cz: 0,
    parentId: 'salon-bookshelf',
  },
  { id: 'salon-desk', catalogId: 'desk-white-kids', cx: 5, cz: 10 },
  { id: 'salon-chair', catalogId: 'chair-swivel-white', cx: 5, cz: 9 },
  {
    id: 'salon-cactus',
    catalogId: 'plant-cactus',
    cx: 5,
    cz: 10,
    parentId: 'salon-desk',
  },
  { id: 'salon-basket', catalogId: 'basket-wicker-pompom', cx: 2, cz: 8 },
  { id: 'salon-beanbag', catalogId: 'beanbag-coral', cx: 6, cz: 7 },
  { id: 'salon-devon', catalogId: 'cat-devon-rex', cx: -2, cz: 6 },
  { id: 'salon-puppy', catalogId: 'dog-puppy-gold', cx: 8, cz: 8 },
]

export function createSalonLayout(): PlacedItem[] {
  return SALON_SLOTS.map((slot) => ({
    instanceId: slot.id,
    catalogId: slot.catalogId,
    cx: slot.cx,
    cz: slot.cz,
    rot: slot.rot ?? 0,
    ...(slot.parentId ? { parentId: slot.parentId } : {}),
  }))
}
