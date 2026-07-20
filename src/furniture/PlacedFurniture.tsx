import { getCatalogItem } from '../catalog'
import { cellToWorld, footprintCells } from '../placement'
import { useRoomStore, type Rotation } from '../store/roomStore'
import { PrimitiveFurniture } from './PrimitiveFurniture'

export function footprintWorldCenter(
  cx: number,
  cz: number,
  rot: Rotation,
  footprint: [number, number],
): { x: number; z: number } {
  const cells = footprintCells(cx, cz, rot, footprint)
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  for (const c of cells) {
    const { x, z } = cellToWorld(c.cx, c.cz)
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }
  return { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 }
}

export function PlacedFurniture() {
  const items = useRoomStore((s) => s.items)

  return (
    <group>
      {items.map((item) => {
        const catalog = getCatalogItem(item.catalogId)
        if (!catalog || catalog.visual.type !== 'primitive') return null

        const { x, z } = footprintWorldCenter(
          item.cx,
          item.cz,
          item.rot,
          catalog.footprint,
        )
        const yRot = (item.rot * Math.PI) / 180

        return (
          <group
            key={item.instanceId}
            position={[x, 0, z]}
            rotation={[0, yRot, 0]}
          >
            <PrimitiveFurniture
              kind={catalog.visual.kind}
              footprint={catalog.footprint}
              tint={catalog.visual.tint}
            />
          </group>
        )
      })}
    </group>
  )
}
