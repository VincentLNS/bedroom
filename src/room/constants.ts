export const CELL_SIZE = 0.5
export const ROOM_WIDTH_M = 3
export const ROOM_DEPTH_M = 4.5
export const ROOM_HEIGHT_M = 2.6
export const GRID_COLS = ROOM_WIDTH_M / CELL_SIZE // 6
export const GRID_ROWS = ROOM_DEPTH_M / CELL_SIZE // 9
export const ROOM_MIN_X = -ROOM_WIDTH_M / 2
export const ROOM_MIN_Z = -ROOM_DEPTH_M / 2
/** Door on -Z wall; clearance cells in front of door center (6-wide grid) */
export const DOOR_CLEARANCE: { cx: number; cz: number }[] = [
  { cx: 2, cz: 0 },
  { cx: 3, cz: 0 },
  { cx: 2, cz: 1 },
  { cx: 3, cz: 1 },
]
