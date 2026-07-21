import { HOUSE_ROOMS, type HouseRoomId } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'
import { usePhoneLayout } from './usePhoneLayout'

const TINY: Record<HouseRoomId, string> = {
  bedroom: 'Ch.',
  hall: 'Cou.',
  salon: 'Sal.',
}

/** Switch between chambre / couloir / salon. */
export function RoomSwitcher() {
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const photoMode = useRoomStore((s) => s.photoMode)
  const phone = usePhoneLayout()

  if (photoMode) return null

  return (
    <div className="room-switcher" role="group" aria-label="Pièces de la maison">
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
          {phone ? TINY[room.id] : room.short}
        </button>
      ))}
    </div>
  )
}
