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
/** Porte sur mur −Z ; zone libre devant (grille 8 de large, porte centrée). */
export const DOOR_CLEARANCE: { cx: number; cz: number }[] = [
  { cx: 3, cz: 0 },
  { cx: 4, cz: 0 },
  { cx: 3, cz: 1 },
  { cx: 4, cz: 1 },
]
