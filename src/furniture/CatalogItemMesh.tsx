import { Suspense } from 'react'
import type { CatalogItem } from '../catalog'
import { CELL_SIZE } from '../room/constants'
import { useLiteFurniture } from '../perf/quality'
import { useRoomStore } from '../store/roomStore'
import { KenneyFurniture } from './KenneyFurniture'
import { MeshErrorBoundary } from './MeshErrorBoundary'
import { PrimitiveFurniture } from './PrimitiveFurniture'

/** Soft stand-in when Kenney OBJ would be too heavy for the device. */
function LiteFurnitureProxy({
  footprint,
  tint,
  opacity,
  selected,
  castShadow,
}: {
  footprint: [number, number]
  tint?: string
  opacity: number
  selected: boolean
  castShadow: boolean
}) {
  const w = footprint[0] * CELL_SIZE * 0.92
  const d = footprint[1] * CELL_SIZE * 0.92
  const h = Math.max(0.22, Math.min(w, d) * 0.85)
  return (
    <group>
      <mesh
        position={[0, h / 2, 0]}
        castShadow={castShadow}
        receiveShadow={castShadow}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={tint ?? '#E8A0B0'}
          roughness={0.55}
          metalness={0.05}
          emissive={selected ? '#fff4dc' : '#000000'}
          emissiveIntensity={selected ? 0.35 : 0}
          opacity={opacity}
          transparent={opacity < 1}
        />
      </mesh>
      <mesh position={[0, h + 0.02, 0]} receiveShadow={castShadow}>
        <boxGeometry args={[w * 0.88, 0.04, d * 0.88]} />
        <meshStandardMaterial
          color={tint ?? '#F0C0C8'}
          roughness={0.7}
          opacity={opacity}
          transparent={opacity < 1}
        />
      </mesh>
    </group>
  )
}

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
  const shadowQuality = useRoomStore((s) => s.shadowQuality)
  const lite = useLiteFurniture(shadowQuality)
  const castShadow = !lite

  const visual = item.visual
  const tint = invalid
    ? '#f08080'
    : visual.type === 'primitive' || visual.type === 'kenney'
      ? visual.tint
      : undefined

  const fallback = (
    <LiteFurnitureProxy
      footprint={item.footprint}
      tint={tint ?? '#E8A0B0'}
      opacity={opacity}
      selected={selected}
      castShadow={castShadow}
    />
  )

  if (visual.type === 'kenney') {
    if (lite) return fallback
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
