import { HOUSE_ROOMS, type HouseRoomId } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'
import { usePhoneLayout } from './usePhoneLayout'

const TINY: Record<HouseRoomId, string> = {
  bedroom: 'Ch.',
  hall: 'Cou.',
  salon: 'Sal.',
  cuisine: 'Cui.',
  bathroom: 'Sdb',
}

type Props = {
  /** `strip` = outside the 3D view (phone). Default overlays the scene. */
  variant?: 'overlay' | 'strip'
}

/** Switch between chambre / couloir / salon. */
export function RoomSwitcher({ variant = 'overlay' }: Props) {
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const photoMode = useRoomStore((s) => s.photoMode)
  const phone = usePhoneLayout()

  if (photoMode) return null

  const compact = phone || variant === 'strip'

  return (
    <div
      className={
        variant === 'strip'
          ? 'room-switcher room-switcher--strip'
          : 'room-switcher'
      }
      role="group"
      aria-label="Pièces de la maison"
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
          onClick={() => setActiveRoom(room.id as HouseRoomId)}
        >
          {compact ? TINY[room.id] : room.short}
        </button>
      ))}
    </div>
  )
}
