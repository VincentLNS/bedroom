import {
  emptyHouseRooms,
  type HouseRoomId,
} from '../house/rooms'
import type { PlacedItem } from '../store/roomStore'
import {
  fileToPlacedItems,
  parseLayout,
  serializeLayout,
  type BedroomFileItemV1,
  type BedroomFileV1,
} from './schema'

export const HOUSE_KIND = 'mini-deco-house' as const

export type HouseFileV2 = {
  version: 2
  kind: typeof HOUSE_KIND
  activeRoom: HouseRoomId
  title?: string
  rooms: {
    bedroom: BedroomFileItemV1[]
    hall: BedroomFileItemV1[]
    salon: BedroomFileItemV1[]
  }
}

const ROOM_IDS: HouseRoomId[] = ['bedroom', 'hall', 'salon']

function isRoomId(value: unknown): value is HouseRoomId {
  return value === 'bedroom' || value === 'hall' || value === 'salon'
}

function isItemList(value: unknown): value is BedroomFileItemV1[] {
  if (!Array.isArray(value)) return false
  // Reuse v1 item validation via a tiny fake file
  const probe = parseLayout({
    version: 1,
    roomId: 'girl-bedroom-v1',
    items: value,
  })
  return probe.ok
}

export function serializeHouse(
  rooms: Record<HouseRoomId, PlacedItem[]>,
  activeRoom: HouseRoomId,
  title?: string,
): HouseFileV2 {
  const cleaned = title?.trim()
  return {
    version: 2,
    kind: HOUSE_KIND,
    activeRoom,
    ...(cleaned ? { title: cleaned.slice(0, 48) } : {}),
    rooms: {
      bedroom: serializeLayout(rooms.bedroom).items,
      hall: serializeLayout(rooms.hall).items,
      salon: serializeLayout(rooms.salon).items,
    },
  }
}

/** Snapshot from store — syncs active wing items into rooms first. */
export function serializeHouseFromState(state: {
  rooms: Record<HouseRoomId, PlacedItem[]>
  activeRoom: HouseRoomId
  items: PlacedItem[]
  roomTitle?: string
}): HouseFileV2 {
  const rooms = {
    ...state.rooms,
    [state.activeRoom]: state.items,
  }
  return serializeHouse(rooms, state.activeRoom, state.roomTitle)
}

export function bedroomFileToHouse(file: BedroomFileV1): HouseFileV2 {
  const defaults = emptyHouseRooms()
  return {
    version: 2,
    kind: HOUSE_KIND,
    activeRoom: 'bedroom',
    rooms: {
      bedroom: file.items,
      hall: serializeLayout(defaults.hall).items,
      salon: serializeLayout(defaults.salon).items,
    },
  }
}

export function parseHouseFile(
  data: unknown,
): { ok: true; file: HouseFileV2 } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Objet maison attendu' }
  }
  const record = data as Record<string, unknown>
  if (record.version !== 2) {
    return { ok: false, error: 'Version maison non prise en charge' }
  }
  if (record.kind !== HOUSE_KIND) {
    return { ok: false, error: 'Fichier maison Mini Déco attendu' }
  }
  if (!isRoomId(record.activeRoom)) {
    return { ok: false, error: 'Pièce active invalide' }
  }
  if (!record.rooms || typeof record.rooms !== 'object') {
    return { ok: false, error: 'Pièces manquantes' }
  }
  const roomsRaw = record.rooms as Record<string, unknown>
  for (const id of ROOM_IDS) {
    if (!isItemList(roomsRaw[id])) {
      return { ok: false, error: `Pièce invalide : ${id}` }
    }
  }
  const title =
    typeof record.title === 'string' ? record.title.trim().slice(0, 48) : undefined

  return {
    ok: true,
    file: {
      version: 2,
      kind: HOUSE_KIND,
      activeRoom: record.activeRoom,
      ...(title ? { title } : {}),
      rooms: {
        bedroom: roomsRaw.bedroom as BedroomFileItemV1[],
        hall: roomsRaw.hall as BedroomFileItemV1[],
        salon: roomsRaw.salon as BedroomFileItemV1[],
      },
    },
  }
}

/** Accept house v2 or legacy single-room v1. */
export function parseAnySave(
  data: unknown,
): { ok: true; file: HouseFileV2 } | { ok: false; error: string } {
  if (data && typeof data === 'object' && (data as { version?: unknown }).version === 2) {
    return parseHouseFile(data)
  }
  const legacy = parseLayout(data)
  if (!legacy.ok) return legacy
  return { ok: true, file: bedroomFileToHouse(legacy.file) }
}

export function houseFileToRooms(
  file: HouseFileV2,
): Record<HouseRoomId, PlacedItem[]> {
  return {
    bedroom: fileToPlacedItems({
      version: 1,
      roomId: 'girl-bedroom-v1',
      items: file.rooms.bedroom,
    }),
    hall: fileToPlacedItems({
      version: 1,
      roomId: 'girl-bedroom-v1',
      items: file.rooms.hall,
    }),
    salon: fileToPlacedItems({
      version: 1,
      roomId: 'girl-bedroom-v1',
      items: file.rooms.salon,
    }),
  }
}
