import {
  emptyHouseRooms,
  HOUSE_ROOM_IDS,
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
  rooms: Record<HouseRoomId, BedroomFileItemV1[]>
}

function isRoomId(value: unknown): value is HouseRoomId {
  return (
    typeof value === 'string' &&
    (HOUSE_ROOM_IDS as string[]).includes(value)
  )
}

function isItemList(value: unknown): value is BedroomFileItemV1[] {
  if (!Array.isArray(value)) return false
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
  const roomItems = {} as Record<HouseRoomId, BedroomFileItemV1[]>
  for (const id of HOUSE_ROOM_IDS) {
    roomItems[id] = serializeLayout(rooms[id] ?? []).items
  }
  return {
    version: 2,
    kind: HOUSE_KIND,
    activeRoom,
    ...(cleaned ? { title: cleaned.slice(0, 48) } : {}),
    rooms: roomItems,
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
  const rooms = {} as Record<HouseRoomId, BedroomFileItemV1[]>
  for (const id of HOUSE_ROOM_IDS) {
    rooms[id] =
      id === 'bedroom'
        ? file.items
        : serializeLayout(defaults[id]).items
  }
  return {
    version: 2,
    kind: HOUSE_KIND,
    activeRoom: 'bedroom',
    rooms,
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
  const defaults = emptyHouseRooms()
  const rooms = {} as Record<HouseRoomId, BedroomFileItemV1[]>

  for (const id of HOUSE_ROOM_IDS) {
    if (roomsRaw[id] === undefined) {
      // Soft-migrate older house saves missing new wings.
      rooms[id] = serializeLayout(defaults[id]).items
      continue
    }
    if (!isItemList(roomsRaw[id])) {
      return { ok: false, error: `Pièce invalide : ${id}` }
    }
    rooms[id] = roomsRaw[id] as BedroomFileItemV1[]
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
      rooms,
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
  const out = {} as Record<HouseRoomId, PlacedItem[]>
  for (const id of HOUSE_ROOM_IDS) {
    out[id] = fileToPlacedItems({
      version: 1,
      roomId: 'girl-bedroom-v1',
      items: file.rooms[id] ?? [],
    })
  }
  return out
}
