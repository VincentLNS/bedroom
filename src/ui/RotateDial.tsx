import { useMemo, useRef, useState } from 'react'
import { useRoomStore, type Rotation } from '../store/roomStore'

function snapRot(degrees: number): Rotation {
  const normalized = ((degrees % 360) + 360) % 360
  const quarter = Math.round(normalized / 90) % 4
  return (quarter * 90) as Rotation
}

/**
 * Continuous rotation dial for the selected item — snaps to 0/90/180/270.
 */
export function RotateDial() {
  const selectedId = useRoomStore((s) => s.selectedId)
  const items = useRoomStore((s) => s.items)
  const setSelectedRotation = useRoomStore((s) => s.setSelectedRotation)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const pendingRot = useRoomStore((s) => s.pendingRot)
  const setPendingRot = useRoomStore((s) => s.setPendingRot)

  const dialRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [previewDeg, setPreviewDeg] = useState<number | null>(null)

  const selected = useMemo(
    () => items.find((i) => i.instanceId === selectedId),
    [items, selectedId],
  )

  const active = selected != null || pendingCatalogId != null
  if (!active) return null

  const baseRot = selected?.rot ?? pendingRot
  const display = previewDeg ?? baseRot

  const applyFromPointer = (clientX: number, clientY: number) => {
    const el = dialRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const deg =
      (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90
    const snapped = snapRot(deg)
    setPreviewDeg(snapped)
    if (selected) setSelectedRotation(snapped)
    else setPendingRot(snapped)
  }

  return (
    <div className="rotate-dial" aria-label="Tourner en continu">
      <div
        ref={dialRef}
        className={
          dragging ? 'rotate-dial-pad rotate-dial-pad--active' : 'rotate-dial-pad'
        }
        role="slider"
        aria-valuemin={0}
        aria-valuemax={270}
        aria-valuenow={baseRot}
        aria-valuetext={`${baseRot} degrés`}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          setDragging(true)
          applyFromPointer(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (!dragging) return
          applyFromPointer(e.clientX, e.clientY)
        }}
        onPointerUp={() => {
          setDragging(false)
          setPreviewDeg(null)
        }}
        onPointerCancel={() => {
          setDragging(false)
          setPreviewDeg(null)
        }}
      >
        <span
          className="rotate-dial-needle"
          style={{ transform: `rotate(${display}deg)` }}
          aria-hidden
        />
        <span className="rotate-dial-label">{display}°</span>
      </div>
      <p className="rotate-dial-hint">Tourne · s’aligne à 90°</p>
    </div>
  )
}
