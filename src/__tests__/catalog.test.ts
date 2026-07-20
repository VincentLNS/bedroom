import { describe, it, expect } from 'vitest'
import { CATALOG, getCatalogItem, listByCategory } from '../catalog'

describe('catalog', () => {
  it('has at least 12 items with unique ids', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(12)
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getCatalogItem returns item by id', () => {
    const first = CATALOG[0]
    expect(getCatalogItem(first.id)).toEqual(first)
    expect(getCatalogItem('missing')).toBeUndefined()
  })

  it('listByCategory filters', () => {
    const beds = listByCategory('beds')
    expect(beds.length).toBeGreaterThan(0)
    expect(beds.every((i) => i.category === 'beds')).toBe(true)
  })

  it('every item has positive integer footprint', () => {
    for (const item of CATALOG) {
      expect(Number.isInteger(item.footprint[0])).toBe(true)
      expect(Number.isInteger(item.footprint[1])).toBe(true)
      expect(item.footprint[0]).toBeGreaterThan(0)
      expect(item.footprint[1]).toBeGreaterThan(0)
    }
  })
})
