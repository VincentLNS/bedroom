import { describe, it, expect } from 'vitest'
import { CATALOG, getCatalogItem, listByCategory } from '../catalog'
import type { CatalogCategory } from '../catalog'
import { GRID_COLS, GRID_ROWS } from '../room/constants'

const HERO_IDS = [
  'bed-louise',
  'desk-louise',
  'chair-swivel-white',
  'lamp-rattan-gold',
  'wardrobe-oak',
  'bookshelf-oak',
  'trofast-low',
  'chest-lego-white',
  'dollhouse-white-grey',
  'rug-hopscotch-pink',
  'basket-wicker-pompom',
  'basket-oval-pink',
  'chair-rattan-child',
  'stitch-blue',
  'angel-pink',
  'lightbox-louise',
] as const

const CATEGORIES: CatalogCategory[] = [
  'beds',
  'desks',
  'storage',
  'toys',
  'soft',
  'decor',
]

describe('catalog', () => {
  it('has at least 12 items with unique ids', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(12)
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes Louise hero set', () => {
    for (const id of HERO_IDS) {
      expect(getCatalogItem(id), `missing hero ${id}`).toBeDefined()
    }
    expect(
      CATALOG.some((i) => i.id === 'lego-camper' || i.id === 'lego-cluster'),
    ).toBe(true)
    expect(
      CATALOG.some(
        (i) => i.id === 'pirate-ship-black' || i.id === 'camper-van-pink',
      ),
    ).toBe(true)
  })

  it('getCatalogItem returns item by id', () => {
    const first = CATALOG[0]
    expect(getCatalogItem(first.id)).toEqual(first)
    expect(getCatalogItem('missing')).toBeUndefined()
  })

  it('listByCategory filters and covers all categories', () => {
    for (const cat of CATEGORIES) {
      const items = listByCategory(cat)
      expect(items.length, `empty category ${cat}`).toBeGreaterThan(0)
      expect(items.every((i) => i.category === cat)).toBe(true)
    }
  })

  it('every item has positive integer footprint fitting 6×9', () => {
    for (const item of CATALOG) {
      expect(Number.isInteger(item.footprint[0])).toBe(true)
      expect(Number.isInteger(item.footprint[1])).toBe(true)
      expect(item.footprint[0]).toBeGreaterThan(0)
      expect(item.footprint[1]).toBeGreaterThan(0)
      expect(item.footprint[0]).toBeLessThanOrEqual(GRID_COLS)
      expect(item.footprint[1]).toBeLessThanOrEqual(GRID_ROWS)
    }
  })
})
