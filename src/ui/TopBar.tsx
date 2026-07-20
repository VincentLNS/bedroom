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
    if (window.confirm('Vider toute la chambre ?')) {
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
        'Importer ce plan ? Les meubles actuels seront remplacés.',
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
        <h1 className="top-bar-title">Chambre de Louise</h1>
        <div
          className="mode-toggle"
          role="group"
          aria-label="Mode d’interaction"
        >
          <button
            type="button"
            className={
              !placing ? 'mode-toggle-btn mode-toggle-btn--active' : 'mode-toggle-btn'
            }
            aria-pressed={!placing}
            onClick={exitPlace}
          >
            Naviguer
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
                ? 'Mode pose — clic gauche pour poser · clic droit ou Échap pour annuler · clic droit maintenu pour tourner la vue'
                : 'Choisissez un meuble dans le catalogue pour poser'
            }
          >
            Poser
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
          Vider
        </button>
        <button type="button" className="top-bar-btn" onClick={handleExport}>
          Exporter
        </button>
        <button type="button" className="top-bar-btn" onClick={handleImportClick}>
          Importer
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
