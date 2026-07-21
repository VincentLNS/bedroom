import type { PlacedItem, Rotation } from '../store/roomStore'

type LouiseSlot = {
  id: string
  catalogId: string
  cx: number
  cz: number
  rot?: Rotation
  parentId?: string
}

/**
 * Layout « Chambre Louise » — grille 8×11.
 *
 * Zones :
 *   sommeil (+X) · bureau (+Z) · jeu (−X) · rangement porte (−Z)
 * Clearance porte : cx 2–3, cz 0–1.
 * Lit : tête −Z, étagère −X (vers la pièce).
 * Maison : façade (porte/fenêtres) vers la pièce (+X).
 */
const LOUISE_SLOTS: LouiseSlot[] = [
  // ── Mur porte (−Z) ────────────────────────────────────────
  { id: 'louise-wardrobe', catalogId: 'wardrobe-oak', cx: 0, cz: 0, rot: 0 },
  { id: 'louise-bookshelf', catalogId: 'bookshelf-oak', cx: 4, cz: 0 },

  // ── Mur lit (+X) ──────────────────────────────────────────
  { id: 'louise-bed', catalogId: 'bed-louise', cx: 6, cz: 3, rot: 0 },
  {
    id: 'louise-stitch',
    catalogId: 'stitch-blue',
    cx: 6,
    cz: 4,
    parentId: 'louise-bed',
  },
  {
    id: 'louise-angel',
    catalogId: 'angel-pink',
    cx: 7,
    cz: 5,
    parentId: 'louise-bed',
  },
  {
    id: 'louise-unicorn',
    catalogId: 'plush-unicorn-pink',
    cx: 6,
    cz: 6,
    parentId: 'louise-bed',
  },
  { id: 'louise-lamp-floor', catalogId: 'floor-lamp-cream', cx: 7, cz: 2 },
  { id: 'louise-nightlight', catalogId: 'night-light-moon', cx: 5, cz: 3 },
  { id: 'louise-rattan', catalogId: 'chair-rattan-child', cx: 4, cz: 7 },
  { id: 'louise-pouf', catalogId: 'pouf-pink', cx: 3, cz: 7 },
  { id: 'louise-basket-1', catalogId: 'basket-wicker-pompom', cx: 5, cz: 9 },

  // ── Mur fenêtre (+Z) : bureau ─────────────────────────────
  { id: 'louise-desk', catalogId: 'desk-louise', cx: 1, cz: 10, rot: 0 },
  { id: 'louise-chair', catalogId: 'chair-swivel-white', cx: 2, cz: 9 },
  {
    id: 'louise-lamp',
    catalogId: 'lamp-rattan-gold',
    cx: 1,
    cz: 10,
    parentId: 'louise-desk',
  },
  {
    id: 'louise-lightbox',
    catalogId: 'lightbox-louise',
    cx: 2,
    cz: 10,
    parentId: 'louise-desk',
  },
  { id: 'louise-basket-oval', catalogId: 'basket-oval-pink', cx: 3, cz: 10 },
  { id: 'louise-plant', catalogId: 'plant-monstera', cx: 6, cz: 10 },

  // ── Mur jeu (−X) : maison → Trofast → coffre ──────────────
  {
    id: 'louise-dollhouse',
    catalogId: 'dollhouse-white-grey',
    cx: 0,
    cz: 2,
    // Façade (porte + fenêtres) vers la pièce
    rot: 90,
  },
  { id: 'louise-trofast', catalogId: 'trofast-low', cx: 0, cz: 5, rot: 90 },
  { id: 'louise-chest', catalogId: 'chest-lego-white', cx: 0, cz: 8, rot: 0 },
  {
    id: 'louise-lego',
    catalogId: 'lego-cluster',
    cx: 0,
    cz: 8,
    rot: 0,
    parentId: 'louise-chest',
  },

  // ── Centre : tapis + jouets ───────────────────────────────
  { id: 'louise-rug', catalogId: 'rug-hopscotch-pink', cx: 3, cz: 4, rot: 0 },
  {
    id: 'louise-pirate',
    catalogId: 'pirate-ship-black',
    cx: 3,
    cz: 5,
    parentId: 'louise-rug',
  },
  {
    id: 'louise-van',
    catalogId: 'camper-van-pink',
    cx: 4,
    cz: 5,
    parentId: 'louise-rug',
  },
  {
    id: 'louise-camper',
    catalogId: 'lego-camper',
    cx: 3,
    cz: 6,
    parentId: 'louise-rug',
  },

  // ── Jardin ───────────────────────────────────────────────
  { id: 'louise-devon', catalogId: 'cat-devon-rex', cx: -2, cz: 8 },
  { id: 'louise-duck', catalogId: 'duck-yellow', cx: -1, cz: 10 },
  { id: 'louise-frog', catalogId: 'frog-green', cx: 8, cz: 4 },
  { id: 'louise-puppy', catalogId: 'dog-puppy-gold', cx: 8, cz: 9 },
]

export function createLouiseLayout(): PlacedItem[] {
  return LOUISE_SLOTS.map((slot) => ({
    instanceId: slot.id,
    catalogId: slot.catalogId,
    cx: slot.cx,
    cz: slot.cz,
    rot: slot.rot ?? 0,
    ...(slot.parentId ? { parentId: slot.parentId } : {}),
  }))
}
