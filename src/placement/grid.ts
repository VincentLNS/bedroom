import {
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
  ROOM_MIN_X,
  ROOM_MIN_Z,
} from '../room/constants'

export { CELL_SIZE, GRID_COLS, GRID_ROWS } from '../room/constants'

export function worldToCell(x: number, z: number): { cx: number; cz: number } {
  return {
    cx: Math.floor((x - ROOM_MIN_X) / CELL_SIZE),
    cz: Math.floor((z - ROOM_MIN_Z) / CELL_SIZE),
  }
}

export function cellToWorld(cx: number, cz: number): { x: number; z: number } {
  return {
    x: ROOM_MIN_X + (cx + 0.5) * CELL_SIZE,
    z: ROOM_MIN_Z + (cz + 0.5) * CELL_SIZE,
  }
}

/** Anchor cell is the min-X/min-Z corner of the rotated footprint AABB. */
export function footprintCells(
  cx: number,
  cz: number,
  rot: number,
  footprint: [number, number] | number[],
): { cx: number; cz: number }[] {
  const [w, d] = footprint
  const r = ((rot % 360) + 360) % 360

  const locals: { lx: number; lz: number }[] = []
  for (let lx = 0; lx < w; lx++) {
    for (let lz = 0; lz < d; lz++) {
      locals.push({ lx, lz })
    }
  }

  const rotated = locals.map(({ lx, lz }) => {
    switch (r) {
      case 90:
        return { ox: lz, oz: w - 1 - lx }
      case 180:
        return { ox: w - 1 - lx, oz: d - 1 - lz }
      case 270:
        return { ox: d - 1 - lz, oz: lx }
      default:
        return { ox: lx, oz: lz }
    }
  })

  const minOx = Math.min(...rotated.map((c) => c.ox))
  const minOz = Math.min(...rotated.map((c) => c.oz))

  return rotated.map(({ ox, oz }) => ({
    cx: cx + ox - minOx,
    cz: cz + oz - minOz,
  }))
}

export function inBounds(cells: { cx: number; cz: number }[]): boolean {
  return cells.every(
    (c) => c.cx >= 0 && c.cx < GRID_COLS && c.cz >= 0 && c.cz < GRID_ROWS,
  )
}
