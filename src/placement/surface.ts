import type { CatalogItem } from '../catalog'
import { getCatalogItem } from '../catalog'
import type { PlacedItem } from '../store/roomStore'
import { canPlace, type Cell, type PlacedFootprint } from './collision'
import { footprintCells } from './grid'

/** Rugs / thin mats — decorate the floor without blocking other furniture. */
export function isFloorUnderlay(catalog: CatalogItem): boolean {
  return catalog.surfaceHeight != null && catalog.surfaceHeight <= 0.05
}

export function cellKey(c: Cell): string {
  return `${c.cx},${c.cz}`
}

export function cellsContainedIn(inner: Cell[], outer: Cell[]): boolean {
  const set = new Set(outer.map(cellKey))
  return inner.every((c) => set.has(cellKey(c)))
}

export function itemFootprint(item: PlacedItem): Cell[] {
  const catalog = getCatalogItem(item.catalogId)
  if (!catalog) return []
  return footprintCells(item.cx, item.cz, item.rot, catalog.footprint)
}

/** Floor-level footprints only (stacked props + underlays do not block). */
export function toFloorOccupied(items: PlacedItem[]): PlacedFootprint[] {
  return items.flatMap((item) => {
    if (item.parentId) return []
    const catalog = getCatalogItem(item.catalogId)
    if (catalog && isFloorUnderlay(catalog)) return []
    const cells = itemFootprint(item)
    if (cells.length === 0) return []
    return [{ instanceId: item.instanceId, cells }]
  })
}

export function toSurfaceOccupied(
  items: PlacedItem[],
  parentId: string,
): PlacedFootprint[] {
  return items.flatMap((item) => {
    if (item.parentId !== parentId) return []
    const cells = itemFootprint(item)
    if (cells.length === 0) return []
    return [{ instanceId: item.instanceId, cells }]
  })
}

/**
 * Pick the smallest floor host whose footprint fully contains `cells`
 * and that declares a surfaceHeight.
 */
export function findSurfaceHost(
  cells: Cell[],
  items: PlacedItem[],
  ignoreInstanceId?: string,
): PlacedItem | null {
  let best: PlacedItem | null = null
  let bestArea = Infinity

  for (const item of items) {
    if (item.instanceId === ignoreInstanceId) continue
    if (item.parentId) continue

    const catalog = getCatalogItem(item.catalogId)
    if (catalog?.surfaceHeight == null) continue

    const hostCells = itemFootprint(item)
    if (!cellsContainedIn(cells, hostCells)) continue

    if (hostCells.length < bestArea) {
      best = item
      bestArea = hostCells.length
    }
  }

  return best
}

/** Surface collision: in-bounds + no sibling overlap (door N/A on hosts). */
export function canPlaceOnSurface(
  cells: Cell[],
  occupiedOnSurface: PlacedFootprint[],
  ignoreInstanceId?: string,
): boolean {
  return canPlace(cells, occupiedOnSurface, ignoreInstanceId, {
    allowGarden: true,
  })
}

export function resolvePlacement(
  catalog: CatalogItem,
  cx: number,
  cz: number,
  rot: PlacedItem['rot'],
  items: PlacedItem[],
  ignoreInstanceId?: string,
): { ok: true; parentId?: string } | { ok: false } {
  const cells = footprintCells(cx, cz, rot, catalog.footprint)
  const allowGarden = catalog.outdoor === true

  if (catalog.nestable) {
    const others = ignoreInstanceId
      ? items.filter((i) => i.instanceId !== ignoreInstanceId)
      : items
    const host = findSurfaceHost(cells, others, ignoreInstanceId)
    if (host) {
      const siblings = toSurfaceOccupied(others, host.instanceId)
      if (!canPlaceOnSurface(cells, siblings, ignoreInstanceId)) {
        return { ok: false }
      }
      return { ok: true, parentId: host.instanceId }
    }
  }

  const floor = toFloorOccupied(items)
  if (!canPlace(cells, floor, ignoreInstanceId, { allowGarden })) {
    return { ok: false }
  }
  return { ok: true }
}

export function surfaceYForItem(
  item: PlacedItem,
  items: PlacedItem[],
): number {
  if (!item.parentId) return 0
  const parent = items.find((i) => i.instanceId === item.parentId)
  if (!parent) return 0
  const catalog = getCatalogItem(parent.catalogId)
  return catalog?.surfaceHeight ?? 0
}
