import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Mesh, Plane, Vector3, type Group } from 'three'
import { getCatalogItem } from '../catalog'
import {
  resolvePlacement,
  surfaceYForItem,
  worldToCell,
  cellToWorld,
  footprintCells,
} from '../placement'
import { useRoomStore, type Rotation } from '../store/roomStore'
import { CatalogItemMesh } from './CatalogItemMesh'
import { setFurnitureHoverCursor } from '../scene/SceneCursor'

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
  y: number
  parentId?: string
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
  const dragging = useRoomStore((s) => s.dragging)

  const groupRef = useRef<Group>(null)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const dragPreviewRef = useRef<DragPreview | null>(null)

  const { camera, pointer, raycaster } = useThree()
  const floorPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), [])
  const hitPoint = useMemo(() => new Vector3(), [])
  const hoveredIdRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    const group = groupRef.current
    if (!group) return
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
    const resolved = resolvePlacement(
      catalog,
      cx,
      cz,
      item.rot,
      useRoomStore.getState().items,
      item.instanceId,
    )
    const valid = resolved.ok
    const y =
      valid && resolved.parentId
        ? surfaceYForItem(
            {
              ...item,
              cx,
              cz,
              parentId: resolved.parentId,
            },
            useRoomStore.getState().items,
          )
        : 0

    if (
      preview.cx !== cx ||
      preview.cz !== cz ||
      preview.valid !== valid ||
      preview.y !== y
    ) {
      const next: DragPreview = {
        ...preview,
        cx,
        cz,
        valid,
        y,
        parentId: resolved.ok ? resolved.parentId : undefined,
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

  // ESC / clearPending sets dragging=false in the store — snap local preview back.
  useEffect(() => {
    if (dragging) return
    if (!dragPreviewRef.current) return
    dragPreviewRef.current = null
    setDragPreview(null)
  }, [dragging])

  useLayoutEffect(() => {
    if (!dragging) return

    const onUp = () => endDrag(true)
    const onCancel = () => endDrag(false)

    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onCancel)

    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, move, setDragging])

  const applyHoverCursor = (instanceId: string | null) => {
    if (!instanceId || mode === 'place') {
      setFurnitureHoverCursor(null)
      return
    }
    const item = useRoomStore
      .getState()
      .items.find((i) => i.instanceId === instanceId)
    if (!item) {
      setFurnitureHoverCursor(null)
      return
    }
    if (item.locked && instanceId === useRoomStore.getState().selectedId) {
      setFurnitureHoverCursor('not-allowed')
      return
    }
    if (instanceId === useRoomStore.getState().selectedId) {
      setFurnitureHoverCursor('grab')
      return
    }
    setFurnitureHoverCursor('pointer')
  }

  useEffect(() => {
    applyHoverCursor(hoveredIdRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, mode, items])

  useEffect(() => {
    return () => setFurnitureHoverCursor(null)
  }, [])

  const onItemClick = (e: ThreeEvent<MouseEvent>, instanceId: string) => {
    e.stopPropagation()
    if (mode === 'place') return
    select(instanceId)
  }

  const onItemPointerOver = (
    e: ThreeEvent<PointerEvent>,
    instanceId: string,
  ) => {
    e.stopPropagation()
    hoveredIdRef.current = instanceId
    applyHoverCursor(instanceId)
  }

  const onItemPointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    hoveredIdRef.current = null
    setFurnitureHoverCursor(null)
  }

  const onItemPointerDown = (
    e: ThreeEvent<PointerEvent>,
    instanceId: string,
    cx: number,
    cz: number,
  ) => {
    if (mode === 'place') return
    if (instanceId !== selectedId) return

    const item = items.find((i) => i.instanceId === instanceId)
    if (item?.locked) {
      useRoomStore
        .getState()
        .flashToast('Verrouillé — appuie sur 🔓 pour bouger', 'info')
      return
    }

    e.stopPropagation()
    const y = item ? surfaceYForItem(item, items) : 0
    const next: DragPreview = {
      instanceId,
      cx,
      cz,
      valid: true,
      y,
      parentId: item?.parentId,
      originCx: cx,
      originCz: cz,
    }
    dragPreviewRef.current = next
    setDragPreview(next)
    setDragging(true)
  }

  // Draw floor hosts first, then stacked props (so tops are clickable)
  const ordered = [...items].sort((a, b) => {
    const ay = a.parentId ? 1 : 0
    const by = b.parentId ? 1 : 0
    return ay - by
  })

  return (
    <group ref={groupRef}>
      {ordered.map((item) => {
        const catalog = getCatalogItem(item.catalogId)
        if (!catalog) return null

        const isSelected = item.instanceId === selectedId
        const preview =
          dragPreview?.instanceId === item.instanceId ? dragPreview : null
        const cx = preview?.cx ?? item.cx
        const cz = preview?.cz ?? item.cz
        const y = preview ? preview.y : surfaceYForItem(item, items)

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
            position={[x, y, z]}
            rotation={[0, yRot, 0]}
            onClick={(e) => onItemClick(e, item.instanceId)}
            onPointerDown={(e) =>
              onItemPointerDown(e, item.instanceId, item.cx, item.cz)
            }
            onPointerOver={(e) => onItemPointerOver(e, item.instanceId)}
            onPointerOut={onItemPointerOut}
          >
            <CatalogItemMesh
              item={catalog}
              opacity={preview ? 0.85 : 1}
              selected={isSelected && !preview}
              invalid={Boolean(preview && !preview.valid)}
            />
          </group>
        )
      })}
    </group>
  )
}
