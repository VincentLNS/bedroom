import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane, Vector3, type Group } from 'three'
import { getCatalogItem } from '../catalog'
import {
  resolvePlacement,
  surfaceYForItem,
  worldToCell,
} from '../placement'
import { useRoomStore } from '../store/roomStore'
import { CatalogItemMesh } from './CatalogItemMesh'
import { footprintWorldCenter } from './PlacedFurniture'

export function GhostPreview() {
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const pendingRot = useRoomStore((s) => s.pendingRot)
  const mode = useRoomStore((s) => s.mode)
  const items = useRoomStore((s) => s.items)

  const { camera, pointer, raycaster } = useThree()
  const floorPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  const hitPoint = useMemo(() => new Vector3(), [])
  const groupRef = useRef<Group>(null)
  const hoverRef = useRef<{
    cx: number
    cz: number
    valid: boolean
    y: number
  } | null>(null)

  const [hover, setHover] = useState<{
    cx: number
    cz: number
    valid: boolean
    y: number
  } | null>(null)

  const catalog =
    pendingCatalogId != null ? getCatalogItem(pendingCatalogId) : undefined
  const placing = mode === 'place' && catalog != null

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
    const resolved = resolvePlacement(catalog, cx, cz, pendingRot, items)
    const y =
      resolved.ok && resolved.parentId
        ? surfaceYForItem(
            {
              instanceId: '_ghost',
              catalogId: catalog.id,
              cx,
              cz,
              rot: pendingRot,
              parentId: resolved.parentId,
            },
            items,
          )
        : 0
    const valid = resolved.ok
    const prev = hoverRef.current

    if (
      prev === null ||
      prev.cx !== cx ||
      prev.cz !== cz ||
      prev.valid !== valid ||
      prev.y !== y
    ) {
      const next = { cx, cz, valid, y }
      hoverRef.current = next
      setHover(next)
    }
  })

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.traverse((obj) => {
      obj.raycast = () => {}
    })
  }, [hover, catalog, pendingRot])

  if (!placing || !catalog || !hover) {
    return null
  }

  const { x, z } = footprintWorldCenter(
    hover.cx,
    hover.cz,
    pendingRot,
    catalog.footprint,
  )
  const yRot = (pendingRot * Math.PI) / 180

  return (
    <group ref={groupRef} position={[x, hover.y, z]} rotation={[0, yRot, 0]}>
      <CatalogItemMesh
        item={catalog}
        opacity={0.55}
        invalid={!hover.valid}
      />
    </group>
  )
}
