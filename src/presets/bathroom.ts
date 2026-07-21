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
 * Salle de bain pastel — lessive, miroir, paniers.
 * Clearance porte cx 2–3, cz 0–1.
 */
const BATHROOM_SLOTS: Slot[] = [
  // Mur porte (−Z)
  {
    id: 'bath-washer',
    catalogId: 'washer-toy',
    cx: 0,
    cz: 0,
    rot: 180,
  },
  {
    id: 'bath-cabinet',
    catalogId: 'cabinet-drawer-cream',
    cx: 5,
    cz: 0,
    rot: 180,
  },

  // Mur −X : miroir + paniers
  {
    id: 'bath-mirror',
    catalogId: 'mirror-round',
    cx: 0,
    cz: 4,
    rot: 90,
  },
  { id: 'bath-basket', catalogId: 'basket-wicker-pompom', cx: 0, cz: 7 },

  // Centre
  { id: 'bath-rug', catalogId: 'rug-cloud', cx: 3, cz: 4 },
  { id: 'bath-trash', catalogId: 'trash-pastel', cx: 6, cz: 5 },

  // Mur fenêtre
  {
    id: 'bath-drawer',
    catalogId: 'cabinet-drawer-table',
    cx: 2,
    cz: 10,
    rot: 180,
  },
  {
    id: 'bath-plant',
    catalogId: 'plant-succulent',
    cx: 2,
    cz: 10,
    parentId: 'bath-drawer',
  },
  { id: 'bath-sky', catalogId: 'basket-sky', cx: 5, cz: 10 },
  { id: 'bath-mint', catalogId: 'basket-mint', cx: 7, cz: 8 },

  // Jardin
  { id: 'bath-frog', catalogId: 'frog-green', cx: 8, cz: 6 },
]

export function createBathroomLayout(): PlacedItem[] {
  return BATHROOM_SLOTS.map((slot) => ({
    instanceId: slot.id,
    catalogId: slot.catalogId,
    cx: slot.cx,
    cz: slot.cz,
    rot: slot.rot ?? 0,
    ...(slot.parentId ? { parentId: slot.parentId } : {}),
  }))
}
