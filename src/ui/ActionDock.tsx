import { useRoomStore } from '../store/roomStore'
import { askConfirm } from './dialogStore'

/**
 * Thumb-zone dock: rotate / cancel / remove / undo / duplicate / lock.
 */
export function ActionDock() {
  const selectedId = useRoomStore((s) => s.selectedId)
  const items = useRoomStore((s) => s.items)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const canUndo = useRoomStore((s) => s.undoStack.length > 0)
  const canRedo = useRoomStore((s) => s.redoStack.length > 0)
  const rotateSelected = useRoomStore((s) => s.rotateSelected)
  const rotatePending = useRoomStore((s) => s.rotatePending)
  const deleteSelected = useRoomStore((s) => s.deleteSelected)
  const duplicateSelected = useRoomStore((s) => s.duplicateSelected)
  const toggleLockSelected = useRoomStore((s) => s.toggleLockSelected)
  const cancelInteraction = useRoomStore((s) => s.cancelInteraction)
  const undo = useRoomStore((s) => s.undo)
  const redo = useRoomStore((s) => s.redo)
  const photoMode = useRoomStore((s) => s.photoMode)

  const selected = items.find((i) => i.instanceId === selectedId)
  const placing = pendingCatalogId != null
  const editing = selectedId != null
  const locked = Boolean(selected?.locked)

  if (photoMode) return null
  if (!placing && !editing && !canUndo && !canRedo) return null

  const onDelete = async () => {
    const ok = await askConfirm({
      title: 'Enlever ce meuble ?',
      message: 'Tu pourras annuler avec ↩ Undo.',
      confirmLabel: 'Enlever',
      danger: true,
    })
    if (!ok) return
    deleteSelected()
  }

  return (
    <div className="action-dock" role="toolbar" aria-label="Actions rapides">
      <button
        type="button"
        className="action-dock-btn"
        onClick={() => undo()}
        disabled={!canUndo}
        title="Annuler le dernier geste (ou tape à deux doigts)"
        aria-label="Annuler le dernier geste"
      >
        ↩
        <span className="action-dock-label">Undo</span>
      </button>
      {(placing || editing) && (
        <button
          type="button"
          className="action-dock-btn action-dock-btn--accent"
          onClick={() => (placing ? rotatePending() : rotateSelected())}
          disabled={editing && locked}
          title="Tourner de 90°"
          aria-label="Tourner de 90 degrés"
        >
          ↻
          <span className="action-dock-label">Tourner</span>
        </button>
      )}
      {placing && (
        <button
          type="button"
          className="action-dock-btn"
          onClick={() => cancelInteraction()}
          title="Lâcher l’objet"
          aria-label="Annuler la pose"
        >
          ✕
          <span className="action-dock-label">Annuler</span>
        </button>
      )}
      {editing && (
        <>
          <button
            type="button"
            className="action-dock-btn"
            onClick={() => duplicateSelected()}
            title="Dupliquer"
            aria-label="Dupliquer le meuble"
          >
            ⎘
            <span className="action-dock-label">Copie</span>
          </button>
          <button
            type="button"
            className={
              locked
                ? 'action-dock-btn action-dock-btn--accent'
                : 'action-dock-btn'
            }
            onClick={() => toggleLockSelected()}
            title={locked ? 'Déverrouiller' : 'Verrouiller'}
            aria-label={locked ? 'Déverrouiller' : 'Verrouiller'}
            aria-pressed={locked}
          >
            {locked ? '🔒' : '🔓'}
            <span className="action-dock-label">
              {locked ? 'Lock' : 'Libre'}
            </span>
          </button>
          <button
            type="button"
            className="action-dock-btn action-dock-btn--danger"
            onClick={() => void onDelete()}
            disabled={locked}
            title="Enlever le meuble"
            aria-label="Enlever le meuble"
          >
            ⌫
            <span className="action-dock-label">Enlever</span>
          </button>
        </>
      )}
      {canRedo && (
        <button
          type="button"
          className="action-dock-btn"
          onClick={() => redo()}
          title="Refaire"
          aria-label="Refaire"
        >
          ↪
          <span className="action-dock-label">Redo</span>
        </button>
      )}
    </div>
  )
}
