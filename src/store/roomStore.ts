import { create } from 'zustand'
import {
  CHALLENGES,
  evaluateChallenges,
  type ChallengeId,
} from '../challenges/challenges'
import { getCatalogItem } from '../catalog'
import {
  cloneHouseRooms,
  emptyHouseRooms,
  type HouseRoomId,
} from '../house/rooms'
import {
  canPlace,
  cellsContainedIn,
  footprintCells,
  itemFootprint,
  isRoomCell,
  resolvePlacement,
  toFloorOccupied,
  type PlacedFootprint,
} from '../placement'

export type Rotation = 0 | 90 | 180 | 270

export type PlacedItem = {
  instanceId: string
  catalogId: string
  cx: number
  cz: number
  rot: Rotation
  /** When set, item sits on this host's surface (not the floor). */
  parentId?: string
  /** Locked items cannot be dragged, rotated, or deleted. */
  locked?: boolean
}

type RoomMode = 'orbit' | 'place' | 'edit'

/** Dollhouse wall display — default cut (Sims-style). */
export type WallMode = 'full' | 'cut' | 'hidden'

/** ¾ dollhouse orbit vs top-down plan (Planner 5D / RoomSketcher). */
export type ViewMode = 'dollhouse' | 'plan'

export type ToastTone = 'info' | 'ok' | 'error'

export type ToastState = {
  message: string
  tone: ToastTone
  id: number
}

export type ShadowQuality = 'auto' | 'off' | 'low' | 'high'

export type CatalogSheet = 'peek' | 'half' | 'full'

export type SnapPulseState = {
  cx: number
  cz: number
  ok: boolean
  id: number
}

const HISTORY_LIMIT = 40
const RECENTS_LIMIT = 12

function cloneItems(items: PlacedItem[]): PlacedItem[] {
  return items.map((item) => ({ ...item }))
}

type RoomState = {
  items: PlacedItem[]
  selectedId: string | null
  mode: RoomMode
  pendingCatalogId: string | null
  pendingRot: Rotation
  dragging: boolean
  curtainsOpen: boolean
  wallMode: WallMode
  viewMode: ViewMode
  showGrid: boolean
  /** Floating Html labels on room portals (Couloir / Salon…). Off by default — less clutter. */
  showDoorLabels: boolean
  wallsAutoHide: boolean
  cameraHomeTick: number
  importWarnings: string[]
  undoStack: PlacedItem[][]
  redoStack: PlacedItem[][]
  toast: ToastState | null
  snapPulse: SnapPulseState | null
  photoMode: boolean
  shadowQuality: ShadowQuality
  bigFingers: boolean
  highContrast: boolean
  catalogSheet: CatalogSheet
  favorites: string[]
  recents: string[]
  challengesDone: ChallengeId[]
  /** Display name for the active home (kids can rename). */
  roomTitle: string
  /** Master SFX mute (snap + fanfare). */
  soundOn: boolean
  /** Soft ambient pad. */
  musicOn: boolean
  /** Parent lock — catalogue / destructive presets frozen. */
  parentLock: boolean
  /** Whole house — each wing keeps its furniture. */
  activeRoom: HouseRoomId
  rooms: Record<HouseRoomId, PlacedItem[]>
  /** Ignore local→peer echo while applying a remote snapshot. */
  applyingRemote: boolean
  setActiveRoom: (room: HouseRoomId) => void
  replaceHouse: (
    rooms: Record<HouseRoomId, PlacedItem[]>,
    activeRoom?: HouseRoomId,
  ) => void
  setRoomTitle: (title: string) => void
  setSoundOn: (on: boolean) => void
  setMusicOn: (on: boolean) => void
  setParentLock: (on: boolean) => void
  place: (catalogId: string, cx: number, cz: number, rot: Rotation) => boolean
  move: (instanceId: string, cx: number, cz: number) => boolean
  rotateSelected: () => boolean
  setSelectedRotation: (rot: Rotation) => boolean
  rotatePending: () => void
  setPendingRot: (rot: Rotation) => void
  deleteSelected: () => void
  duplicateSelected: () => boolean
  toggleLockSelected: () => void
  select: (id: string | null) => void
  setDragging: (dragging: boolean) => void
  armPlace: (catalogId: string) => void
  clearPending: () => void
  cancelInteraction: () => void
  clearRoom: () => void
  replaceLayout: (items: PlacedItem[]) => void
  clearImportWarnings: () => void
  toggleCurtains: () => void
  setCurtainsOpen: (open: boolean) => void
  setWallMode: (mode: WallMode) => void
  cycleWallMode: () => void
  setViewMode: (mode: ViewMode) => void
  setShowGrid: (show: boolean) => void
  toggleShowGrid: () => void
  setShowDoorLabels: (show: boolean) => void
  toggleShowDoorLabels: () => void
  setWallsAutoHide: (on: boolean) => void
  requestCameraHome: () => void
  undo: () => boolean
  redo: () => boolean
  flashToast: (message: string, tone?: ToastTone) => void
  clearToast: () => void
  triggerSnapPulse: (cx: number, cz: number, ok?: boolean) => void
  clearSnapPulse: () => void
  setPhotoMode: (on: boolean) => void
  setShadowQuality: (q: ShadowQuality) => void
  setBigFingers: (on: boolean) => void
  setHighContrast: (on: boolean) => void
  setCatalogSheet: (sheet: CatalogSheet) => void
  toggleFavorite: (catalogId: string) => void
  pushRecent: (catalogId: string) => void
  markChallengeDone: (id: ChallengeId) => void
  refreshChallenges: () => void
  getOccupied: () => PlacedFootprint[]
}

function pushHistory(
  set: (
    partial:
      | Partial<RoomState>
      | ((state: RoomState) => Partial<RoomState>),
  ) => void,
  get: () => RoomState,
) {
  const snapshot = cloneItems(get().items)
  set((state) => ({
    undoStack: [...state.undoStack.slice(-(HISTORY_LIMIT - 1)), snapshot],
    redoStack: [],
  }))
}

function trySetRotation(
  get: () => RoomState,
  set: (
    partial:
      | Partial<RoomState>
      | ((state: RoomState) => Partial<RoomState>),
  ) => void,
  selectedId: string,
  nextRot: Rotation,
): boolean {
  const { items } = get()
  const item = items.find((i) => i.instanceId === selectedId)
  if (!item || item.locked) return false
  if (item.rot === nextRot) return true

  const catalog = getCatalogItem(item.catalogId)
  if (!catalog) return false

  const nextCells = footprintCells(
    item.cx,
    item.cz,
    nextRot,
    catalog.footprint,
  )

  if (item.parentId) {
    const parent = items.find((i) => i.instanceId === item.parentId)
    if (!parent) return false
    const hostCells = itemFootprint(parent)
    if (!cellsContainedIn(nextCells, hostCells)) return false
    const siblings = items.filter(
      (i) => i.parentId === item.parentId && i.instanceId !== selectedId,
    )
    const occupied = siblings.map((s) => ({
      instanceId: s.instanceId,
      cells: itemFootprint(s),
    }))
    if (
      !canPlace(nextCells, occupied, selectedId, {
        allowGarden: catalog.outdoor === true,
      })
    )
      return false

    pushHistory(set, get)
    set((state) => ({
      items: state.items.map((i) =>
        i.instanceId === selectedId ? { ...i, rot: nextRot } : i,
      ),
    }))
    return true
  }

  if (
    !canPlace(nextCells, toFloorOccupied(items), selectedId, {
      allowGarden: catalog.outdoor === true,
    })
  )
    return false

  const children = items.filter((i) => i.parentId === selectedId)
  const detachIds = new Set<string>()
  for (const child of children) {
    const childCells = itemFootprint(child)
    if (!cellsContainedIn(childCells, nextCells)) {
      const childCat = getCatalogItem(child.catalogId)
      if (!childCat) return false
      const floorWithoutChild = toFloorOccupied(
        items.filter((i) => i.instanceId !== child.instanceId),
      )
      const simulatedFloor = floorWithoutChild.map((f) =>
        f.instanceId === selectedId ? { ...f, cells: nextCells } : f,
      )
      if (
        !canPlace(childCells, simulatedFloor, undefined, {
          allowGarden: childCat.outdoor === true,
        })
      )
        return false
      detachIds.add(child.instanceId)
    }
  }

  pushHistory(set, get)
  set((state) => ({
    items: state.items.map((i) => {
      if (i.instanceId === selectedId) return { ...i, rot: nextRot }
      if (detachIds.has(i.instanceId)) {
        const { parentId: _, ...rest } = i
        void _
        return rest
      }
      return i
    }),
  }))
  return true
}

export const useRoomStore = create<RoomState>((set, get) => ({
  items: [],
  selectedId: null,
  mode: 'orbit',
  pendingCatalogId: null,
  pendingRot: 0,
  dragging: false,
  curtainsOpen: true,
  wallMode: 'cut',
  viewMode: 'dollhouse',
  showGrid: true,
  showDoorLabels: false,
  wallsAutoHide: true,
  cameraHomeTick: 0,
  importWarnings: [],
  undoStack: [],
  redoStack: [],
  toast: null,
  snapPulse: null,
  photoMode: false,
  shadowQuality: 'auto',
  bigFingers: false,
  highContrast: false,
  catalogSheet: 'half',
  favorites: [],
  recents: [],
  challengesDone: [],
  roomTitle: 'Chambre de Louise',
  soundOn: true,
  musicOn: false,
  parentLock: false,
  activeRoom: 'bedroom',
  rooms: emptyHouseRooms(),
  applyingRemote: false,

  getOccupied: () => toFloorOccupied(get().items),

  setRoomTitle: (title) => {
    const cleaned = title.trim().slice(0, 48)
    set({ roomTitle: cleaned || 'Chambre de Louise' })
  },

  setSoundOn: (on) => set({ soundOn: on }),

  setMusicOn: (on) => set({ musicOn: on }),

  setParentLock: (on) => {
    if (on) {
      set({
        parentLock: true,
        pendingCatalogId: null,
        mode: 'orbit',
        selectedId: null,
        dragging: false,
      })
      get().flashToast('Mode parent : boîte verrouillée', 'info')
    } else {
      set({ parentLock: false })
      get().flashToast('Mode parent désactivé', 'ok')
    }
  },

  setActiveRoom: (room) => {
    const state = get()
    if (room === state.activeRoom) return
    const rooms = {
      ...state.rooms,
      [state.activeRoom]: cloneItems(state.items),
    }
    set({
      rooms,
      activeRoom: room,
      items: cloneItems(rooms[room]),
      selectedId: null,
      pendingCatalogId: null,
      mode: 'orbit',
      dragging: false,
      undoStack: [],
      redoStack: [],
    })
    get().flashToast(
      room === 'bedroom'
        ? 'Chambre'
        : room === 'hall'
          ? 'Couloir'
          : 'Salon',
      'info',
    )
    get().requestCameraHome()
    get().refreshChallenges()
  },

  replaceHouse: (rooms, activeRoom = 'bedroom') => {
    const next = cloneHouseRooms(rooms)
    set({
      rooms: next,
      activeRoom,
      items: cloneItems(next[activeRoom]),
      selectedId: null,
      pendingCatalogId: null,
      mode: 'orbit',
      dragging: false,
      undoStack: [],
      redoStack: [],
      importWarnings: [],
    })
    get().refreshChallenges()
  },

  flashToast: (message, tone = 'info') =>
    set({ toast: { message, tone, id: Date.now() } }),

  clearToast: () => set({ toast: null }),

  triggerSnapPulse: (cx, cz, ok = true) =>
    set({ snapPulse: { cx, cz, ok, id: Date.now() } }),

  clearSnapPulse: () => set({ snapPulse: null }),

  setPhotoMode: (on) => set({ photoMode: on }),

  setShadowQuality: (q) => set({ shadowQuality: q }),

  setBigFingers: (on) => set({ bigFingers: on }),

  setHighContrast: (on) => set({ highContrast: on }),

  setCatalogSheet: (sheet) => set({ catalogSheet: sheet }),

  toggleFavorite: (catalogId) =>
    set((state) => {
      const has = state.favorites.includes(catalogId)
      return {
        favorites: has
          ? state.favorites.filter((id) => id !== catalogId)
          : [...state.favorites, catalogId],
      }
    }),

  pushRecent: (catalogId) =>
    set((state) => {
      const next = [
        catalogId,
        ...state.recents.filter((id) => id !== catalogId),
      ].slice(0, RECENTS_LIMIT)
      return { recents: next }
    }),

  markChallengeDone: (id) =>
    set((state) => {
      if (state.challengesDone.includes(id)) return state
      const challengesDone = [...state.challengesDone, id]
      const challenge = CHALLENGES.find((c) => c.id === id)
      if (challenge) {
        const stars = '★'.repeat(challenge.stars)
        return {
          challengesDone,
          toast: {
            message: `${stars} Défi réussi : ${challenge.title}`,
            tone: 'ok' as const,
            id: Date.now(),
          },
        }
      }
      return { challengesDone }
    }),

  refreshChallenges: () => {
    const { items, challengesDone } = get()
    const newly = evaluateChallenges(items, challengesDone)
    for (const id of newly) get().markChallengeDone(id)
  },

  undo: () => {
    const { undoStack, items } = get()
    if (undoStack.length === 0) return false
    const prev = undoStack[undoStack.length - 1]
    set({
      items: cloneItems(prev),
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, cloneItems(items)],
      selectedId: null,
      dragging: false,
      mode: 'orbit',
      pendingCatalogId: null,
      pendingRot: 0,
    })
    get().flashToast('Annulé', 'info')
    get().refreshChallenges()
    return true
  },

  redo: () => {
    const { redoStack, items } = get()
    if (redoStack.length === 0) return false
    const next = redoStack[redoStack.length - 1]
    set({
      items: cloneItems(next),
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, cloneItems(items)],
      selectedId: null,
      dragging: false,
      mode: 'orbit',
      pendingCatalogId: null,
      pendingRot: 0,
    })
    get().flashToast('Refait', 'info')
    get().refreshChallenges()
    return true
  },

  place: (catalogId, cx, cz, rot) => {
    const catalog = getCatalogItem(catalogId)
    if (!catalog) return false

    const resolved = resolvePlacement(catalog, cx, cz, rot, get().items)
    if (!resolved.ok) return false

    pushHistory(set, get)
    const instanceId = crypto.randomUUID()
    set((state) => ({
      items: [
        ...state.items,
        {
          instanceId,
          catalogId,
          cx,
          cz,
          rot,
          ...(resolved.parentId ? { parentId: resolved.parentId } : {}),
        },
      ],
    }))
    get().refreshChallenges()
    return true
  },

  move: (instanceId, cx, cz) => {
    const item = get().items.find((i) => i.instanceId === instanceId)
    if (!item || item.locked) return false

    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return false

    const resolved = resolvePlacement(
      catalog,
      cx,
      cz,
      item.rot,
      get().items,
      instanceId,
    )
    if (!resolved.ok) return false

    const dcx = cx - item.cx
    const dcz = cz - item.cz
    if (dcx === 0 && dcz === 0 && resolved.parentId === item.parentId) {
      return true
    }

    pushHistory(set, get)

    set((state) => ({
      items: state.items.map((i) => {
        if (i.instanceId === instanceId) {
          const next: PlacedItem = {
            instanceId: i.instanceId,
            catalogId: i.catalogId,
            cx,
            cz,
            rot: i.rot,
          }
          if (i.locked) next.locked = true
          if (resolved.parentId) next.parentId = resolved.parentId
          return next
        }
        if (i.parentId === instanceId && (dcx !== 0 || dcz !== 0)) {
          return { ...i, cx: i.cx + dcx, cz: i.cz + dcz }
        }
        return i
      }),
    }))
    get().refreshChallenges()
    return true
  },

  rotateSelected: () => {
    const { selectedId, items } = get()
    if (!selectedId) return false
    const item = items.find((i) => i.instanceId === selectedId)
    if (!item) return false
    const nextRot = ((item.rot + 90) % 360) as Rotation
    return trySetRotation(get, set, selectedId, nextRot)
  },

  setSelectedRotation: (rot) => {
    const { selectedId } = get()
    if (!selectedId) return false
    return trySetRotation(get, set, selectedId, rot)
  },

  rotatePending: () =>
    set((state) => ({
      pendingRot: ((state.pendingRot + 90) % 360) as Rotation,
    })),

  setPendingRot: (rot) => set({ pendingRot: rot }),

  deleteSelected: () => {
    const { selectedId, items } = get()
    if (!selectedId) return
    const item = items.find((i) => i.instanceId === selectedId)
    if (item?.locked) {
      get().flashToast('Objet verrouillé — déverrouille d’abord', 'error')
      return
    }

    pushHistory(set, get)
    set((state) => ({
      items: state.items.filter(
        (i) => i.instanceId !== selectedId && i.parentId !== selectedId,
      ),
      selectedId: null,
      mode: 'orbit',
      dragging: false,
    }))
    get().refreshChallenges()
  },

  duplicateSelected: () => {
    const { selectedId, items } = get()
    if (!selectedId) return false
    const item = items.find((i) => i.instanceId === selectedId)
    if (!item) return false
    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return false

    const offsets = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
      [2, 0],
      [0, 2],
    ] as const

    for (const [dx, dz] of offsets) {
      const cx = item.cx + dx
      const cz = item.cz + dz
      const resolved = resolvePlacement(catalog, cx, cz, item.rot, items)
      if (!resolved.ok) continue
      // Prefer same surface type (garden stays garden-ish)
      if (catalog.outdoor && isRoomCell(cx, cz) && !item.parentId) continue

      pushHistory(set, get)
      const instanceId = crypto.randomUUID()
      set((state) => ({
        items: [
          ...state.items,
          {
            instanceId,
            catalogId: item.catalogId,
            cx,
            cz,
            rot: item.rot,
            ...(resolved.parentId ? { parentId: resolved.parentId } : {}),
          },
        ],
        selectedId: instanceId,
        mode: 'edit',
      }))
      get().flashToast('Dupliqué !', 'ok')
      get().refreshChallenges()
      return true
    }

    get().flashToast('Pas de place pour dupliquer', 'error')
    return false
  },

  toggleLockSelected: () => {
    const { selectedId } = get()
    if (!selectedId) return
    set((state) => ({
      items: state.items.map((i) =>
        i.instanceId === selectedId ? { ...i, locked: !i.locked } : i,
      ),
    }))
    const locked = get().items.find((i) => i.instanceId === selectedId)?.locked
    get().flashToast(locked ? 'Verrouillé' : 'Déverrouillé', 'info')
  },

  select: (id) =>
    set({
      selectedId: id,
      mode: id ? 'edit' : 'orbit',
      ...(id ? { pendingCatalogId: null } : {}),
      dragging: false,
    }),

  setDragging: (dragging) => set({ dragging }),

  armPlace: (catalogId) => {
    if (get().parentLock) {
      get().flashToast('Boîte verrouillée — mode parent', 'error')
      return
    }
    get().pushRecent(catalogId)
    set({
      pendingCatalogId: catalogId,
      pendingRot: 0,
      mode: 'place',
      selectedId: null,
      dragging: false,
    })
  },

  clearPending: () =>
    set({
      pendingCatalogId: null,
      pendingRot: 0,
      mode: 'orbit',
      dragging: false,
    }),

  cancelInteraction: () =>
    set({
      pendingCatalogId: null,
      pendingRot: 0,
      selectedId: null,
      mode: 'orbit',
      dragging: false,
    }),

  clearRoom: () => {
    if (get().parentLock) {
      get().flashToast('Mode parent : impossible de vider', 'error')
      return
    }
    if (get().items.length > 0) pushHistory(set, get)
    set({
      items: [],
      selectedId: null,
      dragging: false,
      importWarnings: [],
    })
  },

  replaceLayout: (items) => {
    const warnings: string[] = []
    const byId = new Set<string>()
    const valid = items.filter((item) => {
      if (!getCatalogItem(item.catalogId)) {
        const message = `Meuble inconnu ignoré : ${item.catalogId}`
        warnings.push(message)
        console.warn(message)
        return false
      }
      byId.add(item.instanceId)
      return true
    })

    const cleaned = valid.map((item) => {
      if (item.parentId && !byId.has(item.parentId)) {
        const { parentId: _, ...rest } = item
        void _
        return rest
      }
      return item
    })

    set({
      items: cleaned,
      selectedId: null,
      dragging: false,
      importWarnings: warnings,
      undoStack: [],
      redoStack: [],
    })
    get().refreshChallenges()
  },

  clearImportWarnings: () => set({ importWarnings: [] }),

  toggleCurtains: () =>
    set((state) => ({ curtainsOpen: !state.curtainsOpen })),

  setCurtainsOpen: (open) => set({ curtainsOpen: open }),

  setWallMode: (mode) => set({ wallMode: mode }),

  cycleWallMode: () =>
    set((state) => {
      const order: WallMode[] = ['cut', 'hidden', 'full']
      const i = order.indexOf(state.wallMode)
      return { wallMode: order[(i + 1) % order.length] }
    }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setShowGrid: (show) => set({ showGrid: show }),

  toggleShowGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setShowDoorLabels: (show) => set({ showDoorLabels: show }),

  toggleShowDoorLabels: () =>
    set((state) => ({ showDoorLabels: !state.showDoorLabels })),

  setWallsAutoHide: (on) => set({ wallsAutoHide: on }),

  requestCameraHome: () =>
    set((state) => ({ cameraHomeTick: state.cameraHomeTick + 1 })),
}))

/** Keep house wing inventory in sync with the active room's items. */
useRoomStore.subscribe((state, prev) => {
  if (state.applyingRemote) return
  if (state.items === prev.items) return
  if (state.rooms[state.activeRoom] === state.items) return
  useRoomStore.setState({
    rooms: {
      ...state.rooms,
      [state.activeRoom]: state.items,
    },
  })
})
