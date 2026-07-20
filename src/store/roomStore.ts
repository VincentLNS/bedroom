import { create } from 'zustand'
import { getCatalogItem } from '../catalog'
import { canPlace, footprintCells, type PlacedFootprint } from '../placement'

export type Rotation = 0 | 90 | 180 | 270

export type PlacedItem = {
  instanceId: string
  catalogId: string
  cx: number
  cz: number
  rot: Rotation
}

type RoomMode = 'orbit' | 'place' | 'edit'

type RoomState = {
  items: PlacedItem[]
  selectedId: string | null
  mode: RoomMode
  pendingCatalogId: string | null
  /** True while drag-moving a selected item (disables orbit). */
  dragging: boolean
  place: (catalogId: string, cx: number, cz: number, rot: Rotation) => boolean
  move: (instanceId: string, cx: number, cz: number) => boolean
  rotateSelected: () => boolean
  deleteSelected: () => void
  select: (id: string | null) => void
  setDragging: (dragging: boolean) => void
  armPlace: (catalogId: string) => void
  clearPending: () => void
  clearRoom: () => void
  replaceLayout: (items: PlacedItem[]) => void
  getOccupied: () => PlacedFootprint[]
}

function toOccupied(items: PlacedItem[]): PlacedFootprint[] {
  return items.flatMap((item) => {
    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return []
    return [
      {
        instanceId: item.instanceId,
        cells: footprintCells(item.cx, item.cz, item.rot, catalog.footprint),
      },
    ]
  })
}

export const useRoomStore = create<RoomState>((set, get) => ({
  items: [],
  selectedId: null,
  mode: 'orbit',
  pendingCatalogId: null,
  dragging: false,

  getOccupied: () => toOccupied(get().items),

  place: (catalogId, cx, cz, rot) => {
    const catalog = getCatalogItem(catalogId)
    if (!catalog) return false

    const cells = footprintCells(cx, cz, rot, catalog.footprint)
    if (!canPlace(cells, get().getOccupied())) return false

    const instanceId = crypto.randomUUID()
    set((state) => ({
      items: [...state.items, { instanceId, catalogId, cx, cz, rot }],
    }))
    return true
  },

  move: (instanceId, cx, cz) => {
    const item = get().items.find((i) => i.instanceId === instanceId)
    if (!item) return false

    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return false

    const cells = footprintCells(cx, cz, item.rot, catalog.footprint)
    if (!canPlace(cells, get().getOccupied(), instanceId)) return false

    set((state) => ({
      items: state.items.map((i) =>
        i.instanceId === instanceId ? { ...i, cx, cz } : i,
      ),
    }))
    return true
  },

  rotateSelected: () => {
    const { selectedId, items } = get()
    if (!selectedId) return false

    const item = items.find((i) => i.instanceId === selectedId)
    if (!item) return false

    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return false

    const nextRot = ((item.rot + 90) % 360) as Rotation
    const cells = footprintCells(item.cx, item.cz, nextRot, catalog.footprint)
    if (!canPlace(cells, get().getOccupied(), selectedId)) return false

    set((state) => ({
      items: state.items.map((i) =>
        i.instanceId === selectedId ? { ...i, rot: nextRot } : i,
      ),
    }))
    return true
  },

  deleteSelected: () => {
    const { selectedId } = get()
    if (!selectedId) return

    set((state) => ({
      items: state.items.filter((i) => i.instanceId !== selectedId),
      selectedId: null,
      mode: 'orbit',
      dragging: false,
    }))
  },

  select: (id) =>
    set({
      selectedId: id,
      mode: id ? 'edit' : 'orbit',
      ...(id ? { pendingCatalogId: null } : {}),
      dragging: false,
    }),

  setDragging: (dragging) => set({ dragging }),

  armPlace: (catalogId) =>
    set({
      pendingCatalogId: catalogId,
      mode: 'place',
      selectedId: null,
      dragging: false,
    }),

  clearPending: () =>
    set({ pendingCatalogId: null, mode: 'orbit', dragging: false }),

  clearRoom: () =>
    set({ items: [], selectedId: null, dragging: false }),

  replaceLayout: (items) => set({ items, selectedId: null, dragging: false }),
}))
