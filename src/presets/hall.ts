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
 * Couloir / entrée — passage entre chambre et salon.
 * Banc Kenney : assise −Z local → rot 270 pour regarder vers le centre (−X→+X).
 * Miroir primitif : face +Z local → rot 90 contre mur −X (glace vers +X).
 */
const HALL_SLOTS: Slot[] = [
  { id: 'hall-rug', catalogId: 'rug-cloud', cx: 3, cz: 4 },
  { id: 'hall-coat', catalogId: 'coat-rack-standing', cx: 0, cz: 2 },
  { id: 'hall-plant', catalogId: 'plant-monstera', cx: 7, cz: 3 },
  // Assise vers le passage / centre de la pièce
  {
    id: 'hall-bench',
    catalogId: 'bench-cushion-pink',
    cx: 5,
    cz: 8,
    rot: 270,
  },
  { id: 'hall-basket', catalogId: 'basket-wicker-small', cx: 1, cz: 8 },
  { id: 'hall-mirror', catalogId: 'mirror-round', cx: 0, cz: 5, rot: 90 },
  { id: 'hall-lamp', catalogId: 'floor-lamp-square', cx: 7, cz: 9 },
  { id: 'hall-frame', catalogId: 'frame-photo-pink', cx: 6, cz: 2, rot: 180 },
  { id: 'hall-puppy', catalogId: 'dog-puppy-gold', cx: 8, cz: 6 },
]

export function createHallLayout(): PlacedItem[] {
  return HALL_SLOTS.map((slot) => ({
    instanceId: slot.id,
    catalogId: slot.catalogId,
    cx: slot.cx,
    cz: slot.cz,
    rot: slot.rot ?? 0,
    ...(slot.parentId ? { parentId: slot.parentId } : {}),
  }))
}
