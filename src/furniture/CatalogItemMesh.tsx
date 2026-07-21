import { Suspense } from 'react'
import type { CatalogItem } from '../catalog'
import { KenneyFurniture } from './KenneyFurniture'
import { MeshErrorBoundary } from './MeshErrorBoundary'
import { PrimitiveFurniture } from './PrimitiveFurniture'

/** Renders whichever visual the catalogue item declares. */
export function CatalogItemMesh({
  item,
  opacity = 1,
  selected = false,
  invalid = false,
}: {
  item: CatalogItem
  opacity?: number
  selected?: boolean
  invalid?: boolean
}) {
  const visual = item.visual
  const tint = invalid
    ? '#f08080'
    : visual.type === 'primitive' || visual.type === 'kenney'
      ? visual.tint
      : undefined

  const fallback = (
    <mesh position={[0, 0.15, 0]} castShadow>
      <boxGeometry
        args={[item.footprint[0] * 0.4, 0.3, item.footprint[1] * 0.4]}
      />
      <meshStandardMaterial
        color={tint ?? '#E8A0B0'}
        opacity={opacity}
        transparent={opacity < 1}
      />
    </mesh>
  )

  if (visual.type === 'kenney') {
    return (
      <MeshErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <KenneyFurniture
            model={visual.model}
            footprint={item.footprint}
            tint={tint}
            surfaceHeight={item.surfaceHeight}
            opacity={opacity}
            selected={selected}
          />
        </Suspense>
      </MeshErrorBoundary>
    )
  }

  if (visual.type === 'primitive') {
    return (
      <PrimitiveFurniture
        kind={visual.kind}
        footprint={item.footprint}
        tint={tint}
        opacity={opacity}
        selected={selected}
      />
    )
  }

  return fallback
}
