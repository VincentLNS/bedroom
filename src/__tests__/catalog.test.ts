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
  'animals',
]

describe('catalog', () => {
  it('has at least 130 items with unique ids', () => {
    expect(CATALOG.length).toBeGreaterThanOrEqual(130)
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes stylish wave items', () => {
    expect(getCatalogItem('sofa-blush')).toBeDefined()
    expect(getCatalogItem('vanity-pink')).toBeDefined()
    expect(getCatalogItem('garden-swing')?.outdoor).toBe(true)
    expect(getCatalogItem('mushroom-lamp')?.nestable).toBe(true)
  })

  it('includes bathroom and kitchen fixtures wave', () => {
    const ids = [
      'bathtub-blush',
      'shower-sky',
      'toilet-cream',
      'sink-bathroom-mint',
      'cabinet-bathroom-cream',
      'mirror-bathroom',
      'dryer-sky',
      'washer-dryer-stack',
      'stove-electric-pink',
      'sink-kitchen-sky',
      'fridge-tall-cream',
      'kitchen-bar-oak',
      'pillow-coral',
      'pillow-long-cream',
      'bed-double-blush',
      'bear-honey',
      'sandbox-garden',
      'aquarium-sky',
    ] as const
    for (const id of ids) {
      expect(getCatalogItem(id), `missing ${id}`).toBeDefined()
    }
    expect(getCatalogItem('sandbox-garden')?.outdoor).toBe(true)
    expect(getCatalogItem('pillow-coral')?.nestable).toBe(true)
    expect(getCatalogItem('aquarium-sky')?.nestable).toBe(true)
    expect(getCatalogItem('bathtub-blush')?.footprint).toEqual([3, 1])
    expect(getCatalogItem('shower-sky')?.footprint).toEqual([2, 1])
    expect(getCatalogItem('sink-bathroom-mint')?.surfaceHeight).toBeTypeOf(
      'number',
    )
    expect(getCatalogItem('stove-gas-cream')).toBeDefined()
    expect(getCatalogItem('cabinet-upper-double')).toBeDefined()
    expect(getCatalogItem('table-cross-cloth')).toBeDefined()
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

  it('includes animals with outdoor garden placement', () => {
    const devon = getCatalogItem('cat-devon-rex')
    expect(devon).toBeDefined()
    expect(devon?.outdoor).toBe(true)
    expect(devon?.category).toBe('animals')
    expect(listByCategory('animals').length).toBeGreaterThanOrEqual(5)
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

  it('every item has positive integer footprint fitting the room grid', () => {
    for (const item of CATALOG) {
      expect(Number.isInteger(item.footprint[0])).toBe(true)
      expect(Number.isInteger(item.footprint[1])).toBe(true)
      expect(item.footprint[0]).toBeGreaterThan(0)
      expect(item.footprint[1]).toBeGreaterThan(0)
      expect(item.footprint[0]).toBeLessThanOrEqual(GRID_COLS)
      expect(item.footprint[1]).toBeLessThanOrEqual(GRID_ROWS)
      expect(item.visual.type === 'primitive' || item.visual.type === 'kenney').toBe(
        true,
      )
      if (item.visual.type === 'primitive') {
        expect(item.visual.kind).toBeTruthy()
      }
      if (item.visual.type === 'kenney') {
        expect(item.visual.model).toBeTruthy()
      }
    }
  })
})
