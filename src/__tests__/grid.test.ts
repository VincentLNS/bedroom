import { describe, it, expect } from 'vitest'
import {
  worldToCell,
  cellToWorld,
  footprintCells,
  inBounds,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from '../placement'

describe('grid', () => {
  it('exposes 0.5m cells on 3x4.5 room', () => {
    expect(CELL_SIZE).toBe(0.5)
    expect(GRID_COLS).toBe(6)
    expect(GRID_ROWS).toBe(9)
  })

  it('worldToCell snaps to integers', () => {
    expect(worldToCell(-1.5 + 0.1, -2.25 + 0.1)).toEqual({ cx: 0, cz: 0 })
    expect(worldToCell(0, 0)).toEqual({ cx: 3, cz: 4 })
  })

  it('cellToWorld returns cell centers', () => {
    const { x, z } = cellToWorld(0, 0)
    expect(x).toBeCloseTo(-1.5 + CELL_SIZE / 2)
    expect(z).toBeCloseTo(-2.25 + CELL_SIZE / 2)
  })

  it('footprintCells rotates 90 degrees', () => {
    const at0 = footprintCells(1, 1, 0, [2, 1])
    expect(at0).toHaveLength(2)
    const at90 = footprintCells(1, 1, 90, [2, 1])
    expect(at90).toHaveLength(2)
    expect(new Set(at90.map((c) => `${c.cx},${c.cz}`)).size).toBe(2)
  })

  it('inBounds rejects out of room', () => {
    expect(inBounds([{ cx: 0, cz: 0 }])).toBe(true)
    expect(inBounds([{ cx: -1, cz: 0 }])).toBe(false)
    expect(inBounds([{ cx: 6, cz: 0 }])).toBe(false)
  })
})
