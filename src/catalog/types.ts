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
  | 'bedLouise'
  | 'desk'
  | 'deskLouise'
  | 'chair'
  | 'chairSwivel'
  | 'chairRattan'
  | 'shelf'
  | 'bookshelf'
  | 'wardrobe'
  | 'trofast'
  | 'chest'
  | 'rug'
  | 'rugHopscotch'
  | 'lamp'
  | 'lampRattan'
  | 'plant'
  | 'toy'
  | 'dollhouse'
  | 'beanbag'
  | 'mirror'
  | 'blocks'
  | 'basket'
  | 'plush'
  | 'lightbox'
  | 'legoCamper'
  | 'legoCluster'
  | 'pirateShip'
  | 'camperVan'

export type CatalogItem = {
  id: string
  name: string
  category: CatalogCategory
  footprint: [widthCells: number, depthCells: number]
  visual: CatalogVisual
}
