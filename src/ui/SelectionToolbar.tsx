import { useRoomStore } from '../store/roomStore'

export function SelectionToolbar() {
  const selectedId = useRoomStore((s) => s.selectedId)
  const rotateSelected = useRoomStore((s) => s.rotateSelected)
  const deleteSelected = useRoomStore((s) => s.deleteSelected)

  if (!selectedId) return null

  return (
    <div className="selection-toolbar" role="toolbar" aria-label="Selection">
      <button
        type="button"
        className="selection-toolbar-btn"
        onClick={() => rotateSelected()}
      >
        Rotate
      </button>
      <button
        type="button"
        className="selection-toolbar-btn selection-toolbar-btn--danger"
        onClick={() => deleteSelected()}
      >
        Delete
      </button>
    </div>
  )
}
