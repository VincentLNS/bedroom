export const CELL_SIZE = 0.5
/** Largeur (axe X, murs longs) — un peu plus généreuse que l’estimation photo 3 m. */
export const ROOM_WIDTH_M = 4
/** Profondeur porte→fenêtre (axe Z). */
export const ROOM_DEPTH_M = 5.5
export const ROOM_HEIGHT_M = 2.6
export const GRID_COLS = ROOM_WIDTH_M / CELL_SIZE // 8
export const GRID_ROWS = ROOM_DEPTH_M / CELL_SIZE // 11
export const ROOM_MIN_X = -ROOM_WIDTH_M / 2
export const ROOM_MIN_Z = -ROOM_DEPTH_M / 2

/** Anneau de pelouse placeable autour de la chambre (cellules). */
export const GARDEN_MARGIN_CELLS = 3
export const WORLD_MIN_CX = -GARDEN_MARGIN_CELLS
export const WORLD_MIN_CZ = -GARDEN_MARGIN_CELLS
export const WORLD_MAX_CX = GRID_COLS + GARDEN_MARGIN_CELLS // exclusive
export const WORLD_MAX_CZ = GRID_ROWS + GARDEN_MARGIN_CELLS // exclusive
export const GARDEN_WIDTH_M =
  ROOM_WIDTH_M + GARDEN_MARGIN_CELLS * 2 * CELL_SIZE
export const GARDEN_DEPTH_M =
  ROOM_DEPTH_M + GARDEN_MARGIN_CELLS * 2 * CELL_SIZE

/** Door width on the −Z wall (meters). */
export const DOOR_WIDTH_M = 1
/**
 * Door center on X — shifted left of room center (−X)
 * so the opening sits closer to the wardrobe wall.
 */
export const DOOR_CENTER_X = -0.5

/**
 * Porte sur mur −Z ; zone libre devant l’ouverture (2 cellules × 2).
 * Door spans x∈[−1, 0] → cells cx 2–3.
 */
export const DOOR_CLEARANCE: { cx: number; cz: number }[] = [
  { cx: 2, cz: 0 },
  { cx: 3, cz: 0 },
  { cx: 2, cz: 1 },
  { cx: 3, cz: 1 },
]
