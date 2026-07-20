import { useRef } from 'react'
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
  const replaceLayout = useRoomStore((s) => s.replaceLayout)
  const clearImportWarnings = useRoomStore((s) => s.clearImportWarnings)
  const items = useRoomStore((s) => s.items)
  const importWarnings = useRoomStore((s) => s.importWarnings)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      <h1 className="top-bar-title">Bedroom</h1>
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
