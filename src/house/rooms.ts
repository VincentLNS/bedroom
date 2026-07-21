import type { BedroomFileV1 } from '../persist/schema'
import { createHallLayout } from '../presets/hall'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'
import type { PlacedItem } from '../store/roomStore'

export type HouseRoomId = 'bedroom' | 'hall' | 'salon'

export const HOUSE_ROOMS: {
  id: HouseRoomId
  label: string
  short: string
}[] = [
  { id: 'bedroom', label: 'Chambre', short: 'Chambre' },
  { id: 'hall', label: 'Couloir', short: 'Couloir' },
  { id: 'salon', label: 'Salon', short: 'Salon' },
]

export type HouseSnapshot = {
  activeRoom: HouseRoomId
  rooms: Record<HouseRoomId, PlacedItem[]>
}

export function emptyHouseRooms(): Record<HouseRoomId, PlacedItem[]> {
  return {
    bedroom: createLouiseLayout(),
    hall: createHallLayout(),
    salon: createSalonLayout(),
  }
}

export function cloneHouseRooms(
  rooms: Record<HouseRoomId, PlacedItem[]>,
): Record<HouseRoomId, PlacedItem[]> {
  return {
    bedroom: rooms.bedroom.map((i) => ({ ...i })),
    hall: rooms.hall.map((i) => ({ ...i })),
    salon: rooms.salon.map((i) => ({ ...i })),
  }
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
