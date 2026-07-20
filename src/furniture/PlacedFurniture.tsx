import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Mesh, Plane, Vector3, type Group } from 'three'
import { getCatalogItem } from '../catalog'
import { canPlace, cellToWorld, footprintCells, worldToCell } from '../placement'
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

type DragPreview = {
  instanceId: string
  cx: number
  cz: number
  valid: boolean
  originCx: number
  originCz: number
}

export function PlacedFurniture() {
  const items = useRoomStore((s) => s.items)
  const mode = useRoomStore((s) => s.mode)
  const selectedId = useRoomStore((s) => s.selectedId)
  const select = useRoomStore((s) => s.select)
  const move = useRoomStore((s) => s.move)
  const setDragging = useRoomStore((s) => s.setDragging)
  const getOccupied = useRoomStore((s) => s.getOccupied)
  const dragging = useRoomStore((s) => s.dragging)

  const groupRef = useRef<Group>(null)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const dragPreviewRef = useRef<DragPreview | null>(null)

  const { camera, pointer, raycaster, gl } = useThree()
  const floorPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  const hitPoint = useMemo(() => new Vector3(), [])

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
    // Placed meshes must not steal floor clicks while placing.
    group.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      obj.raycast = mode === 'place' ? () => {} : Mesh.prototype.raycast
    })
  }, [mode, items])

  useFrame(() => {
    if (!dragging || !dragPreviewRef.current) return

    const preview = dragPreviewRef.current
    const item = useRoomStore
      .getState()
      .items.find((i) => i.instanceId === preview.instanceId)
    if (!item) return

    const catalog = getCatalogItem(item.catalogId)
    if (!catalog) return

    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(floorPlane, hitPoint)
    if (!hit) return

    const { cx, cz } = worldToCell(hitPoint.x, hitPoint.z)
    const cells = footprintCells(cx, cz, item.rot, catalog.footprint)
    const valid = canPlace(cells, getOccupied(), item.instanceId)

    if (
      preview.cx !== cx ||
      preview.cz !== cz ||
      preview.valid !== valid
    ) {
      const next: DragPreview = {
        ...preview,
        cx,
        cz,
        valid,
      }
      dragPreviewRef.current = next
      setDragPreview(next)
    }
  })

  const endDrag = (commit: boolean) => {
    const preview = dragPreviewRef.current
    dragPreviewRef.current = null
    setDragPreview(null)
    setDragging(false)

    if (commit && preview?.valid) {
      move(preview.instanceId, preview.cx, preview.cz)
    }
  }

  useLayoutEffect(() => {
    if (!dragging) return

    const onUp = () => endDrag(true)
    const onCancel = () => endDrag(false)

    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)
    // Prevent orbit from eating the gesture while dragging.
    gl.domElement.style.cursor = 'grabbing'

    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
      gl.domElement.style.cursor = ''
    }
    // endDrag closes over latest move/setDragging via store getters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, gl, move, setDragging])

  const onItemClick = (e: ThreeEvent<MouseEvent>, instanceId: string) => {
    e.stopPropagation()
    if (mode === 'place') return
    select(instanceId)
  }

  const onItemPointerDown = (
    e: ThreeEvent<PointerEvent>,
    instanceId: string,
    cx: number,
    cz: number,
  ) => {
    if (mode === 'place') return
    if (instanceId !== selectedId) return

    e.stopPropagation()
    const next: DragPreview = {
      instanceId,
      cx,
      cz,
      valid: true,
      originCx: cx,
      originCz: cz,
    }
    dragPreviewRef.current = next
    setDragPreview(next)
    setDragging(true)
  }

  return (
    <group ref={groupRef}>
      {items.map((item) => {
        const catalog = getCatalogItem(item.catalogId)
        if (!catalog || catalog.visual.type !== 'primitive') return null

        const isSelected = item.instanceId === selectedId
        const preview =
          dragPreview?.instanceId === item.instanceId ? dragPreview : null
        const cx = preview?.cx ?? item.cx
        const cz = preview?.cz ?? item.cz

        const { x, z } = footprintWorldCenter(
          cx,
          cz,
          item.rot,
          catalog.footprint,
        )
        const yRot = (item.rot * Math.PI) / 180

        return (
          <group
            key={item.instanceId}
            position={[x, 0, z]}
            rotation={[0, yRot, 0]}
            onClick={(e) => onItemClick(e, item.instanceId)}
            onPointerDown={(e) =>
              onItemPointerDown(e, item.instanceId, item.cx, item.cz)
            }
          >
            <PrimitiveFurniture
              kind={catalog.visual.kind}
              footprint={catalog.footprint}
              tint={
                preview && !preview.valid
                  ? '#f08080'
                  : catalog.visual.tint
              }
              opacity={preview ? 0.85 : 1}
              selected={isSelected && !preview}
            />
          </group>
        )
      })}
    </group>
  )
}
