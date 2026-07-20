import { DOOR_CLEARANCE } from '../room/constants'
import { inBounds, inWorldBounds, isRoomCell } from './grid'

export type Cell = { cx: number; cz: number }
export type PlacedFootprint = { instanceId: string; cells: Cell[] }

const doorSet = new Set(DOOR_CLEARANCE.map((c) => `${c.cx},${c.cz}`))

export type CanPlaceOptions = {
  /** Allow cells in the garden ring around the room. */
  allowGarden?: boolean
}

export function canPlace(
  cells: Cell[],
  occupied: PlacedFootprint[],
  ignoreInstanceId?: string,
  options?: CanPlaceOptions,
): boolean {
  if (options?.allowGarden) {
    if (!inWorldBounds(cells)) return false
  } else if (!inBounds(cells)) {
    return false
  }

  for (const c of cells) {
    // Door clearance only applies inside the bedroom.
    if (isRoomCell(c.cx, c.cz) && doorSet.has(`${c.cx},${c.cz}`)) return false
  }

  const blocked = new Set<string>()
  for (const item of occupied) {
    if (item.instanceId === ignoreInstanceId) continue
    for (const c of item.cells) blocked.add(`${c.cx},${c.cz}`)
  }
  return cells.every((c) => !blocked.has(`${c.cx},${c.cz}`))
}
