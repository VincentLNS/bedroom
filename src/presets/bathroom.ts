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
 * Salle de bain pastel — baignoire, douche, lessive.
 * Clearance porte cx 2–3, cz 0–1.
 *
 * Orientation Kenney : façade = −Z local
 * → rot 180 mur porte (−Z), rot 270 mur −X, rot 0 mur fenêtre (+Z).
 */
const BATHROOM_SLOTS: Slot[] = [
  // Mur porte (−Z) — toilettes à gauche, baignoire longue à droite
  {
    id: 'bath-toilet',
    catalogId: 'toilet-cream',
    cx: 0,
    cz: 0,
    rot: 180,
  },
  {
    id: 'bath-tub',
    catalogId: 'bathtub-blush',
    cx: 4,
    cz: 0,
    rot: 180,
  },

  // Mur −X — douche puis lavabo + miroir + meuble (façades vers +X)
  {
    id: 'bath-shower',
    catalogId: 'shower-sky',
    cx: 0,
    cz: 2,
    rot: 270,
  },
  {
    id: 'bath-sink',
    catalogId: 'sink-bathroom-mint',
    cx: 0,
    cz: 5,
    rot: 270,
  },
  {
    id: 'bath-mirror',
    catalogId: 'mirror-bathroom',
    cx: 0,
    cz: 6,
    rot: 270,
  },
  {
    id: 'bath-cabinet',
    catalogId: 'cabinet-bathroom-cream',
    cx: 0,
    cz: 8,
    rot: 270,
  },
  {
    id: 'bath-plant',
    catalogId: 'plant-succulent',
    cx: 0,
    cz: 8,
    parentId: 'bath-cabinet',
  },

  // Centre
  { id: 'bath-rug', catalogId: 'rug-cloud', cx: 3, cz: 4 },
  { id: 'bath-basket', catalogId: 'basket-wicker-pompom', cx: 4, cz: 6 },

  // Mur fenêtre (+Z) — lessive face à la pièce
  {
    id: 'bath-washer',
    catalogId: 'washer-toy',
    cx: 1,
    cz: 10,
    rot: 0,
  },
  {
    id: 'bath-dryer',
    catalogId: 'dryer-sky',
    cx: 3,
    cz: 10,
    rot: 0,
  },
  { id: 'bath-hamper', catalogId: 'basket-sky', cx: 5, cz: 10 },
  { id: 'bath-trash', catalogId: 'trash-pastel', cx: 7, cz: 8 },

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
