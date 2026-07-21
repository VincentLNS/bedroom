import { describe, expect, it, beforeEach } from 'vitest'
import {
  getFurnitureHoverCursor,
  setFurnitureHoverCursor,
} from '../scene/SceneCursor'

describe('furniture hover cursor', () => {
  beforeEach(() => {
    setFurnitureHoverCursor(null)
  })

  it('stores the latest hover cursor', () => {
    setFurnitureHoverCursor('pointer')
    expect(getFurnitureHoverCursor()).toBe('pointer')
    setFurnitureHoverCursor('grab')
    expect(getFurnitureHoverCursor()).toBe('grab')
    setFurnitureHoverCursor('not-allowed')
    expect(getFurnitureHoverCursor()).toBe('not-allowed')
    setFurnitureHoverCursor(null)
    expect(getFurnitureHoverCursor()).toBeNull()
  })

  it('ignores duplicate updates', () => {
    setFurnitureHoverCursor('grab')
    setFurnitureHoverCursor('grab')
    expect(getFurnitureHoverCursor()).toBe('grab')
  })
})
