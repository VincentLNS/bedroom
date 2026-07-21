import { describe, expect, it } from 'vitest'
import { getCatalogItem } from '../catalog'
import {
  canPlace,
  cellsContainedIn,
  footprintCells,
  itemFootprint,
  toFloorOccupied,
  toSurfaceOccupied,
} from '../placement'
import { createSalonLayout } from '../presets/salon'

describe('createSalonLayout', () => {
  it('places every salon item without floor/surface clash', () => {
    const layout = createSalonLayout()
    expect(layout.length).toBeGreaterThanOrEqual(8)

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
