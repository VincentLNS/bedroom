import { useEffect, useRef } from 'react'
import {
  downloadBedroomFile,
  fileToPlacedItems,
  readBedroomFile,
  serializeLayout,
} from '../persist'
import { useRoomStore } from '../store/roomStore'

export function TopBar() {
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const clearPending = useRoomStore((s) => s.clearPending)
  const select = useRoomStore((s) => s.select)
  const replaceLayout = useRoomStore((s) => s.replaceLayout)
  const clearImportWarnings = useRoomStore((s) => s.clearImportWarnings)
  const items = useRoomStore((s) => s.items)
  const importWarnings = useRoomStore((s) => s.importWarnings)
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const placing = mode === 'place'
  const hasPending = pendingCatalogId != null

  const exitPlace = () => {
    clearPending()
    select(null)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      const store = useRoomStore.getState()
      store.clearPending()
      store.select(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleClearRoom = () => {
    if (window.confirm('Clear all furniture from the room?')) {
      clearRoom()
      clearPending()
    }
  }

  const handleExport = () => {
    downloadBedroomFile(serializeLayout(items))
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await readBedroomFile(file)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    if (
      !window.confirm(
        'Import this layout? Current furniture will be replaced.',
      )
    ) {
      return
    }

    clearImportWarnings()
    replaceLayout(fileToPlacedItems(result.file))
  }

  return (
    <header className="top-bar">
      <div className="top-bar-leading">
        <h1 className="top-bar-title">Bedroom</h1>
        <div
          className="mode-toggle"
          role="group"
          aria-label="Camera mode"
        >
          <button
            type="button"
            className={
              !placing ? 'mode-toggle-btn mode-toggle-btn--active' : 'mode-toggle-btn'
            }
            aria-pressed={!placing}
            onClick={exitPlace}
          >
            Orbit
          </button>
          <button
            type="button"
            className={
              placing ? 'mode-toggle-btn mode-toggle-btn--active' : 'mode-toggle-btn'
            }
            aria-pressed={placing}
            disabled={!hasPending && !placing}
            title={
              hasPending || placing
                ? 'Place mode — tap the floor to place'
                : 'Pick a catalogue item to enter Place mode'
            }
          >
            Place
          </button>
        </div>
        {hasPending && (
          <button
            type="button"
            className="top-bar-btn top-bar-btn--cancel"
            onClick={() => clearPending()}
          >
            Annuler
          </button>
        )}
      </div>
      <div className="top-bar-actions">
        {importWarnings.length > 0 && (
          <p className="top-bar-warning" role="status">
            {importWarnings.join(' · ')}
          </p>
        )}
        <button type="button" className="top-bar-btn" onClick={handleClearRoom}>
          Clear room
        </button>
        <button type="button" className="top-bar-btn" onClick={handleExport}>
          Export
        </button>
        <button type="button" className="top-bar-btn" onClick={handleImportClick}>
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.bedroom.json,application/json"
          hidden
          onChange={handleImportFile}
        />
      </div>
    </header>
  )
}
