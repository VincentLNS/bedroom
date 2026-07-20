export type CatalogCategory =
  | 'beds'
  | 'desks'
  | 'storage'
  | 'toys'
  | 'soft'
  | 'decor'
  | 'animals'

export type CatalogVisual =
  | { type: 'primitive'; tint?: string; kind: PrimitiveKind }
  /** Kenney Furniture Kit (CC0) model name without extension. */
  | { type: 'kenney'; model: string; tint?: string }
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
  | 'plushStitch'
  | 'plushAngel'
  | 'lightbox'
  | 'legoCamper'
  | 'legoCluster'
  | 'pirateShip'
  | 'camperVan'
  | 'nightstand'
  | 'dresser'
  | 'canopyBed'
  | 'stool'
  | 'easel'
  | 'playTent'
  | 'teepee'
  | 'rockingHorse'
  | 'plushBear'
  | 'plushUnicorn'
  | 'plushDino'
  | 'trainSet'
  | 'ball'
  | 'scooter'
  | 'xylophone'
  | 'globe'
  | 'nightLight'
  | 'toyKitchen'
  | 'laundryHamper'
  | 'floorLamp'
  | 'booksStack'
  | 'crayonBox'
  | 'dollPram'
  | 'cloudRug'
  | 'pouf'
  | 'photoFrame'
  | 'floorMattress'
  | 'animalDevonRex'
  | 'animalPuppy'
  | 'animalRabbit'
  | 'animalDuck'
  | 'animalHedgehog'
  | 'animalFrog'
  | 'animalBird'
  | 'vanityPink'
  | 'starMobile'
  | 'mushroomLamp'
  | 'rainbowShelf'
  | 'musicBox'
  | 'fairyLights'
  | 'toyCastle'
  | 'dreamcatcher'
  | 'toySlide'
  | 'gardenSwing'
  | 'miniTrampoline'
  | 'cloudShelf'

export type CatalogItem = {
  id: string
  name: string
  category: CatalogCategory
  footprint: [widthCells: number, depthCells: number]
  visual: CatalogVisual
  /** Top surface height in meters — item can host nestable props.
   *  Values ≤ 0.05 (rugs) are floor underlays: they host toys but don’t block furniture. */
  surfaceHeight?: number
  /** May sit on a surface (bed, desk, tapis…) instead of only the floor. */
  nestable?: boolean
  /** May also be placed in the garden ring around the bedroom. */
  outdoor?: boolean
}
