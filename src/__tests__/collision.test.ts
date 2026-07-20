import { describe, it, expect } from 'vitest'
import { canPlace } from '../placement'
import { footprintCells } from '../placement'
import { DOOR_CLEARANCE } from '../room/constants'

describe('canPlace', () => {
  it('allows empty in-bounds footprint', () => {
    const cells = footprintCells(2, 2, 0, [1, 1])
    expect(canPlace(cells, [])).toBe(true)
  })

  it('rejects overlap with another item', () => {
    const a = footprintCells(2, 2, 0, [2, 2])
    const b = footprintCells(2, 2, 0, [1, 1])
    expect(canPlace(b, [{ instanceId: 'a', cells: a }])).toBe(false)
  })

  it('ignores self when moving', () => {
    const cells = footprintCells(2, 2, 0, [2, 2])
    expect(
      canPlace(cells, [{ instanceId: 'a', cells }], 'a'),
    ).toBe(true)
  })

  it('rejects door clearance cells', () => {
    expect(canPlace(DOOR_CLEARANCE.slice(0, 1), [])).toBe(false)
  })

  it('rejects out of bounds', () => {
    expect(canPlace([{ cx: -1, cz: 0 }], [])).toBe(false)
  })

  it('allows garden cells when allowGarden is set', () => {
    expect(canPlace([{ cx: -1, cz: 5 }], [], undefined, { allowGarden: true })).toBe(
      true,
    )
    expect(canPlace([{ cx: 8, cz: 5 }], [], undefined, { allowGarden: true })).toBe(
      true,
    )
  })
})
