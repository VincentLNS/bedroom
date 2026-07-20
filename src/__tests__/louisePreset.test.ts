import { describe, expect, it } from 'vitest'
import { getCatalogItem } from '../catalog'
import {
  canPlace,
  cellsContainedIn,
  findSurfaceHost,
  footprintCells,
  itemFootprint,
  resolvePlacement,
  toFloorOccupied,
  toSurfaceOccupied,
} from '../placement'
import { createLouiseLayout } from '../presets/louise'
import type { PlacedItem } from '../store/roomStore'

describe('createLouiseLayout', () => {
  it('places every Louise item without floor/surface clash', () => {
    const layout = createLouiseLayout()
    expect(layout.length).toBeGreaterThanOrEqual(12)

    const byId = new Map(layout.map((i) => [i.instanceId, i]))
    const floorOccupied = toFloorOccupied([])

    for (const item of layout) {
      const catalog = getCatalogItem(item.catalogId)
      expect(catalog, `missing catalog ${item.catalogId}`).toBeDefined()
      if (!catalog) continue

      const cells = footprintCells(item.cx, item.cz, item.rot, catalog.footprint)

      if (item.parentId) {
        const parent = byId.get(item.parentId)
        expect(parent, `missing parent ${item.parentId}`).toBeDefined()
        if (!parent) continue
        expect(getCatalogItem(parent.catalogId)?.surfaceHeight).toBeTypeOf(
          'number',
        )
        expect(catalog.nestable).toBe(true)
        expect(cellsContainedIn(cells, itemFootprint(parent))).toBe(true)

        const siblings = toSurfaceOccupied(
          layout.filter((i) => i.instanceId !== item.instanceId),
          item.parentId,
        )
        expect(
          canPlace(cells, siblings),
          `${item.catalogId} overlaps sibling on ${item.parentId}`,
        ).toBe(true)
      } else {
        expect(
          canPlace(cells, floorOccupied, undefined, {
            allowGarden: catalog.outdoor === true,
          }),
          `${item.catalogId} @ (${item.cx},${item.cz}) rot ${item.rot}`,
        ).toBe(true)
        floorOccupied.push({ instanceId: item.instanceId, cells })
      }
    }
  })
})

describe('surface stacking', () => {
  it('stacks a nestable plush on a bed', () => {
    const bed: PlacedItem = {
      instanceId: 'bed',
      catalogId: 'bed-louise',
      cx: 6,
      cz: 4,
      rot: 0,
    }
    const stitchCat = getCatalogItem('stitch-blue')!
    const resolved = resolvePlacement(stitchCat, 6, 5, 0, [bed])
    expect(resolved).toEqual({ ok: true, parentId: 'bed' })
  })

  it('rejects a second item on the same surface cell', () => {
    const items: PlacedItem[] = [
      {
        instanceId: 'bed',
        catalogId: 'bed-louise',
        cx: 6,
        cz: 4,
        rot: 0,
      },
      {
        instanceId: 'stitch',
        catalogId: 'stitch-blue',
        cx: 6,
        cz: 5,
        rot: 0,
        parentId: 'bed',
      },
    ]
    const angel = getCatalogItem('angel-pink')!
    expect(resolvePlacement(angel, 6, 5, 0, items)).toEqual({ ok: false })
  })

  it('findSurfaceHost prefers the smallest containing surface', () => {
    const items: PlacedItem[] = [
      {
        instanceId: 'rug',
        catalogId: 'rug-hopscotch-pink',
        cx: 3,
        cz: 4,
        rot: 0,
      },
      {
        instanceId: 'desk',
        catalogId: 'desk-louise',
        cx: 2,
        cz: 10,
        rot: 0,
      },
    ]
    const cells = footprintCells(2, 10, 0, [1, 1])
    const host = findSurfaceHost(cells, items)
    expect(host?.instanceId).toBe('desk')
  })

  it('stacks nestable toys on a rug', () => {
    const rug: PlacedItem = {
      instanceId: 'rug',
      catalogId: 'rug-hopscotch-pink',
      cx: 3,
      cz: 4,
      rot: 0,
    }
    const pirate = getCatalogItem('pirate-ship-black')!
    expect(resolvePlacement(pirate, 3, 5, 0, [rug])).toEqual({
      ok: true,
      parentId: 'rug',
    })
  })

  it('lets floor furniture share cells with a rug underlay', () => {
    const rug: PlacedItem = {
      instanceId: 'rug',
      catalogId: 'rug-hopscotch-pink',
      cx: 3,
      cz: 4,
      rot: 0,
    }
    const chair = getCatalogItem('chair-rattan-child')!
    expect(resolvePlacement(chair, 3, 5, 0, [rug])).toEqual({ ok: true })
  })

  it('places Devon Rex in the garden', () => {
    const cat = getCatalogItem('cat-devon-rex')!
    expect(resolvePlacement(cat, -2, 8, 0, [])).toEqual({ ok: true })
    expect(resolvePlacement(cat, 3, 5, 0, [])).toEqual({ ok: true })
    const bed = getCatalogItem('bed-louise')!
    expect(resolvePlacement(bed, -2, 8, 0, [])).toEqual({ ok: false })
  })
})
