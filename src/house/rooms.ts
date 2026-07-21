import type { BedroomFileV1 } from '../persist/schema'
import { createBathroomLayout } from '../presets/bathroom'
import { createCuisineLayout } from '../presets/cuisine'
import { createHallLayout } from '../presets/hall'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'
import type { PlacedItem } from '../store/roomStore'

export type HouseRoomId =
  | 'bedroom'
  | 'hall'
  | 'salon'
  | 'cuisine'
  | 'bathroom'

export const HOUSE_ROOMS: {
  id: HouseRoomId
  label: string
  short: string
}[] = [
  { id: 'bedroom', label: 'Chambre', short: 'Chambre' },
  { id: 'hall', label: 'Couloir', short: 'Couloir' },
  { id: 'salon', label: 'Salon', short: 'Salon' },
  { id: 'cuisine', label: 'Cuisine', short: 'Cuisine' },
  { id: 'bathroom', label: 'Salle de bain', short: 'Sdb' },
]

export const HOUSE_ROOM_IDS: HouseRoomId[] = HOUSE_ROOMS.map((r) => r.id)

export function roomLabel(id: HouseRoomId): string {
  return HOUSE_ROOMS.find((r) => r.id === id)?.label ?? id
}

export type HouseSnapshot = {
  activeRoom: HouseRoomId
  rooms: Record<HouseRoomId, PlacedItem[]>
}

export function emptyHouseRooms(): Record<HouseRoomId, PlacedItem[]> {
  return {
    bedroom: createLouiseLayout(),
    hall: createHallLayout(),
    salon: createSalonLayout(),
    cuisine: createCuisineLayout(),
    bathroom: createBathroomLayout(),
  }
}

export function cloneHouseRooms(
  rooms: Partial<Record<HouseRoomId, PlacedItem[]>>,
): Record<HouseRoomId, PlacedItem[]> {
  const defaults = emptyHouseRooms()
  const out = {} as Record<HouseRoomId, PlacedItem[]>
  for (const id of HOUSE_ROOM_IDS) {
    const source = rooms[id] ?? defaults[id]
    out[id] = source.map((i) => ({ ...i }))
  }
  return out
}

/** Serialize active room only (legacy share / file). */
export function roomToFile(items: PlacedItem[]): BedroomFileV1 {
  return {
    version: 1,
    roomId: 'girl-bedroom-v1',
    items: items.map(({ instanceId, catalogId, cx, cz, rot, parentId }) => ({
      instanceId,
      catalogId,
      x: cx,
      z: cz,
      rot,
      ...(parentId ? { parentId } : {}),
    })),
  }
}
