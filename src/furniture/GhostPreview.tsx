import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane, Vector3, type Group } from 'three'
import { getCatalogItem } from '../catalog'
import {
  canPlace,
  footprintCells,
  worldToCell,
} from '../placement'
import { useRoomStore, type Rotation } from '../store/roomStore'
import { PrimitiveFurniture } from './PrimitiveFurniture'
import { footprintWorldCenter } from './PlacedFurniture'

const VALID_TINT = '#9fe6c3'
const INVALID_TINT = '#f08080'
export const PLACE_ROT: Rotation = 0

export function GhostPreview() {
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const mode = useRoomStore((s) => s.mode)
  const getOccupied = useRoomStore((s) => s.getOccupied)

  const { camera, pointer, raycaster } = useThree()
  const floorPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  const hitPoint = useMemo(() => new Vector3(), [])
  const groupRef = useRef<Group>(null)
  const hoverRef = useRef<{
    cx: number
    cz: number
    valid: boolean
  } | null>(null)

  const [hover, setHover] = useState<{
    cx: number
    cz: number
    valid: boolean
  } | null>(null)

  const catalog =
    pendingCatalogId != null ? getCatalogItem(pendingCatalogId) : undefined
  const placing = mode === 'place' && catalog?.visual.type === 'primitive'

  useFrame(() => {
    if (!placing || !catalog) {
      if (hoverRef.current !== null) {
        hoverRef.current = null
        setHover(null)
      }
      return
    }

    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(floorPlane, hitPoint)
    if (!hit) {
      if (hoverRef.current !== null) {
        hoverRef.current = null
        setHover(null)
      }
      return
    }

    const { cx, cz } = worldToCell(hitPoint.x, hitPoint.z)
    const cells = footprintCells(cx, cz, PLACE_ROT, catalog.footprint)
    const valid = canPlace(cells, getOccupied())
    const prev = hoverRef.current

    if (
      prev === null ||
      prev.cx !== cx ||
      prev.cz !== cz ||
      prev.valid !== valid
    ) {
      const next = { cx, cz, valid }
      hoverRef.current = next
      setHover(next)
    }
  })

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    // Ghost must not steal clicks from the placement floor plane.
    group.traverse((obj) => {
      obj.raycast = () => {}
    })
  }, [hover, catalog])

  if (!placing || !catalog || catalog.visual.type !== 'primitive' || !hover) {
    return null
  }

  const { x, z } = footprintWorldCenter(
    hover.cx,
    hover.cz,
    PLACE_ROT,
    catalog.footprint,
  )
  const yRot = (PLACE_ROT * Math.PI) / 180

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, yRot, 0]}>
      <PrimitiveFurniture
        kind={catalog.visual.kind}
        footprint={catalog.footprint}
        tint={hover.valid ? VALID_TINT : INVALID_TINT}
        opacity={0.55}
      />
    </group>
  )
}
