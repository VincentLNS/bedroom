export type CatalogCategory =
  | 'beds'
  | 'desks'
  | 'storage'
  | 'toys'
  | 'soft'
  | 'decor'

export type CatalogVisual =
  | { type: 'primitive'; tint?: string; kind: PrimitiveKind }
  | { type: 'gltf'; src: string; tint?: string }

export type PrimitiveKind =
  | 'bed'
  | 'desk'
  | 'chair'
  | 'shelf'
  | 'chest'
  | 'rug'
  | 'lamp'
  | 'plant'
  | 'toy'
  | 'beanbag'
  | 'mirror'
  | 'blocks'

export type CatalogItem = {
  id: string
  name: string
  category: CatalogCategory
  footprint: [widthCells: number, depthCells: number]
  visual: CatalogVisual
}
