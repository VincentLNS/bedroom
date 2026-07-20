import { useRoomStore } from '../store/roomStore'

export function TopBar() {
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const clearPending = useRoomStore((s) => s.clearPending)

  const handleClearRoom = () => {
    if (window.confirm('Clear all furniture from the room?')) {
      clearRoom()
      clearPending()
    }
  }

  return (
    <header className="top-bar">
      <h1 className="top-bar-title">Bedroom</h1>
      <div className="top-bar-actions">
        <button type="button" className="top-bar-btn" onClick={handleClearRoom}>
          Clear room
        </button>
        <button type="button" className="top-bar-btn" disabled title="Coming soon">
          Export
        </button>
        <button type="button" className="top-bar-btn" disabled title="Coming soon">
          Import
        </button>
      </div>
    </header>
  )
}
