import { HOUSE_ROOMS, type HouseRoomId } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'

/** Switch between chambre / couloir / salon. */
export function RoomSwitcher() {
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const photoMode = useRoomStore((s) => s.photoMode)

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
          onClick={() => setActiveRoom(room.id as HouseRoomId)}
        >
          {room.short}
        </button>
      ))}
    </div>
  )
}
