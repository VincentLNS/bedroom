export * from './types'
export { CATALOG } from './items'
import { CATALOG } from './items'
import type { CatalogCategory, CatalogItem } from './types'

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((item) => item.id === id)
}

export function listByCategory(category: CatalogCategory): CatalogItem[] {
  return CATALOG.filter((item) => item.category === category)
}
