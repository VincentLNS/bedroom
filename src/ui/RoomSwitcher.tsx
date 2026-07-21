import { useEffect, useRef, useState } from 'react'
import { HOUSE_ROOMS, roomLabel, type HouseRoomId } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'
import { usePhoneLayout } from './usePhoneLayout'

const TINY: Record<HouseRoomId, string> = {
  bedroom: 'Ch.',
  hall: 'Cou.',
  salon: 'Sal.',
  cuisine: 'Cui.',
  bathroom: 'Sdb',
}

const COLLAPSE_MS = 2800

type Props = {
  /** `strip` = outside the 3D view (phone). Default overlays the scene. */
  variant?: 'overlay' | 'strip'
}

/**
 * Room switcher — overlay stays collapsed as a small chip so the 3D view
 * stays clean; doors still work. Phone strip stays always visible.
 */
export function RoomSwitcher({ variant = 'overlay' }: Props) {
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const photoMode = useRoomStore((s) => s.photoMode)
  const phone = usePhoneLayout()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOverlay = variant === 'overlay' && !phone

  useEffect(() => {
    if (!isOverlay || !open) return

    const onPointerDown = (event: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      if (event.target instanceof Node && el.contains(event.target)) return
      setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [isOverlay, open])

  useEffect(() => {
    if (!isOverlay || !open) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(false), COLLAPSE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isOverlay, open, activeRoom])

  if (photoMode) return null

  const compact = phone || variant === 'strip'
  const active = HOUSE_ROOMS.find((r) => r.id === activeRoom)

  const bumpTimer = () => {
    if (!isOverlay || !open) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(false), COLLAPSE_MS)
  }

  if (isOverlay && !open) {
    return (
      <div
        ref={rootRef}
        className="room-switcher room-switcher--chip"
        role="group"
        aria-label="Pièces de la maison"
      >
        <button
          type="button"
          className="room-switcher-chip"
          aria-expanded={false}
          aria-haspopup="listbox"
          aria-label={`Pièce : ${active?.label ?? roomLabel(activeRoom)}`}
          title="Changer de pièce (ou utilise les portes)"
          onClick={() => setOpen(true)}
        >
          <span className="room-switcher-chip-label">
            {active?.short ?? roomLabel(activeRoom)}
          </span>
          <span className="room-switcher-chip-caret" aria-hidden>
            ▾
          </span>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className={
        variant === 'strip'
          ? 'room-switcher room-switcher--strip'
          : open
            ? 'room-switcher room-switcher--expanded'
            : 'room-switcher'
      }
      role="group"
      aria-label="Pièces de la maison"
      onPointerMove={bumpTimer}
    >
      {HOUSE_ROOMS.map((room) => (
        <button
          key={room.id}
          type="button"
          className={
            activeRoom === room.id
              ? 'room-switcher-btn room-switcher-btn--active'
              : 'room-switcher-btn'
          }
          aria-pressed={activeRoom === room.id}
          aria-label={room.label}
          onClick={() => {
            setActiveRoom(room.id as HouseRoomId)
            if (isOverlay) setOpen(false)
          }}
        >
          {compact ? TINY[room.id] : room.short}
        </button>
      ))}
    </div>
  )
}
