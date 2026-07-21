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
 * Preset « Salon cosy » — même grille 8×11.
 * Clearance porte cx 2–3, cz 0–1.
 *
 * Kenney loungeSofa / chaises : assise = −Z local.
 * Contre mur −X → rot 270 (face +X / pièce).
 * Contre mur porte (−Z) → rot 180 (face +Z).
 * Bureau Kenney contre fenêtre : tiroirs vers la pièce → rot 180.
 */
const SALON_SLOTS: Slot[] = [
  // Canapé contre mur jeu (−X), assise vers le centre
  { id: 'salon-sofa', catalogId: 'sofa-blush', cx: 0, cz: 4, rot: 270 },
  { id: 'salon-ottoman', catalogId: 'pouf-mint', cx: 3, cz: 6 },
  { id: 'salon-rug', catalogId: 'rug-round-yellow', cx: 3, cz: 4 },
  { id: 'salon-table', catalogId: 'coffee-table-oak', cx: 3, cz: 7 },
  { id: 'salon-lamp', catalogId: 'floor-lamp-cream', cx: 6, cz: 3 },
  { id: 'salon-plant', catalogId: 'plant-monstera', cx: 7, cz: 5 },
  {
    id: 'salon-bookshelf',
    catalogId: 'bookshelf-oak',
    cx: 0,
    cz: 0,
    rot: 180,
  },
  {
    id: 'salon-books',
    catalogId: 'books-stack-desk',
    cx: 0,
    cz: 0,
    parentId: 'salon-bookshelf',
  },
  // Bureau fenêtre : face utile vers la pièce, chaise face au bureau
  { id: 'salon-desk', catalogId: 'desk-white-kids', cx: 5, cz: 10, rot: 180 },
  {
    id: 'salon-chair',
    catalogId: 'chair-swivel-white',
    cx: 5,
    cz: 9,
    rot: 180,
  },
  {
    id: 'salon-cactus',
    catalogId: 'plant-cactus',
    cx: 5,
    cz: 10,
    parentId: 'salon-desk',
  },
  { id: 'salon-basket', catalogId: 'basket-wicker-pompom', cx: 2, cz: 8 },
  // Beanbag vers le centre (primitive / soft — rot 270 oriente le « dos »)
  { id: 'salon-beanbag', catalogId: 'beanbag-coral', cx: 6, cz: 7, rot: 270 },
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
