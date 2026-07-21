import { useEffect, useRef, useState } from 'react'
import {
  downloadBedroomFile,
  houseFileToRooms,
  readHouseFile,
  serializeHouseFromState,
} from '../persist'
import {
  deleteCloudSave,
  listCloudSaves,
  loadCloudSave,
  saveToCloud,
} from '../persist/cloudSaves'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'
import { useRoomStore, type WallMode } from '../store/roomStore'
import { CoachTip } from './CoachTip'
import { useCoarsePointer } from './useCoarsePointer'
import {
  nextShadowQuality,
  shadowQualityLabel,
} from '../room/lighting'
import { exportSouvenirPdf } from './souvenirPdf'

const WALL_OPTIONS: { mode: WallMode; label: string }[] = [
  { mode: 'cut', label: 'Coupés' },
  { mode: 'hidden', label: 'Sans' },
  { mode: 'full', label: 'Complets' },
]

type TopBarProps = {
  onOpenShareQr: () => void
  onOpenCoPlay: () => void
  onOpenGallery: () => void
}

export function TopBar({
  onOpenShareQr,
  onOpenCoPlay,
  onOpenGallery,
}: TopBarProps) {
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const clearPending = useRoomStore((s) => s.clearPending)
  const select = useRoomStore((s) => s.select)
  const replaceLayout = useRoomStore((s) => s.replaceLayout)
  const replaceHouse = useRoomStore((s) => s.replaceHouse)
  const clearImportWarnings = useRoomStore((s) => s.clearImportWarnings)
  const importWarnings = useRoomStore((s) => s.importWarnings)
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const curtainsOpen = useRoomStore((s) => s.curtainsOpen)
  const toggleCurtains = useRoomStore((s) => s.toggleCurtains)
  const wallMode = useRoomStore((s) => s.wallMode)
  const setWallMode = useRoomStore((s) => s.setWallMode)
  const viewMode = useRoomStore((s) => s.viewMode)
  const setViewMode = useRoomStore((s) => s.setViewMode)
  const showGrid = useRoomStore((s) => s.showGrid)
  const toggleShowGrid = useRoomStore((s) => s.toggleShowGrid)
  const requestCameraHome = useRoomStore((s) => s.requestCameraHome)
  const canUndo = useRoomStore((s) => s.undoStack.length > 0)
  const undo = useRoomStore((s) => s.undo)
  const setPhotoMode = useRoomStore((s) => s.setPhotoMode)
  const photoMode = useRoomStore((s) => s.photoMode)
  const shadowQuality = useRoomStore((s) => s.shadowQuality)
  const setShadowQuality = useRoomStore((s) => s.setShadowQuality)
  const bigFingers = useRoomStore((s) => s.bigFingers)
  const setBigFingers = useRoomStore((s) => s.setBigFingers)
  const highContrast = useRoomStore((s) => s.highContrast)
  const setHighContrast = useRoomStore((s) => s.setHighContrast)
  const flashToast = useRoomStore((s) => s.flashToast)
  const roomTitle = useRoomStore((s) => s.roomTitle)
  const setRoomTitle = useRoomStore((s) => s.setRoomTitle)
  const soundOn = useRoomStore((s) => s.soundOn)
  const setSoundOn = useRoomStore((s) => s.setSoundOn)
  const musicOn = useRoomStore((s) => s.musicOn)
  const setMusicOn = useRoomStore((s) => s.setMusicOn)
  const parentLock = useRoomStore((s) => s.parentLock)
  const setParentLock = useRoomStore((s) => s.setParentLock)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coarse = useCoarsePointer()
  const [moreOpen, setMoreOpen] = useState(false)

  if (photoMode) return null

  const placing = mode === 'place'
  const hasPending = pendingCatalogId != null

  const exitPlace = () => {
    useRoomStore.getState().cancelInteraction()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      const store = useRoomStore.getState()

      // Escape is handled globally in App (capture) — avoid double-handling here.
      if (event.key === 'Escape' || event.code === 'Escape') return

      if ((event.key === 'z' || event.key === 'Z') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        if (event.shiftKey) store.redo()
        else store.undo()
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (store.selectedId) {
          event.preventDefault()
          store.deleteSelected()
        }
        return
      }

      if (event.key === 'r' || event.key === 'R') {
        if (store.pendingCatalogId != null || store.mode === 'place') {
          event.preventDefault()
          store.rotatePending()
          return
        }
        if (store.selectedId) {
          event.preventDefault()
          store.rotateSelected()
        }
        return
      }

      if (event.key === 'g' || event.key === 'G') {
        event.preventDefault()
        store.toggleShowGrid()
        return
      }

      if (event.key === 'h' || event.key === 'H') {
        event.preventDefault()
        store.requestCameraHome()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleEmptyPreset = () => {
    if (parentLock) {
      flashToast('Mode parent : impossible de vider', 'error')
      return
    }
    if (
      window.confirm(
        'On vide toute la chambre pour recommencer ? Tes meubles actuels disparaîtront.',
      )
    ) {
      clearRoom()
      clearPending()
      select(null)
      setMoreOpen(false)
    }
  }

  const handleLouisePreset = () => {
    if (parentLock) {
      flashToast('Mode parent : modèles verrouillés', 'error')
      return
    }
    if (
      window.confirm(
        'On charge le modèle « Chambre de Louise » ? Tes meubles actuels seront remplacés.',
      )
    ) {
      clearImportWarnings()
      replaceLayout(createLouiseLayout())
      clearPending()
      select(null)
      setMoreOpen(false)
    }
  }

  const handleSalonPreset = () => {
    if (parentLock) {
      flashToast('Mode parent : modèles verrouillés', 'error')
      return
    }
    if (
      window.confirm(
        'On charge le modèle « Salon cosy » ? Tes meubles actuels seront remplacés.',
      )
    ) {
      clearImportWarnings()
      replaceLayout(createSalonLayout())
      clearPending()
      select(null)
      setMoreOpen(false)
    }
  }

  const handleRenameRoom = () => {
    const next =
      window.prompt('Nom de la chambre ?', roomTitle)?.trim() ?? ''
    if (!next) return
    setRoomTitle(next)
    flashToast('Chambre renommée !', 'ok')
  }

  const handleSouvenirPdf = async () => {
    const result = await exportSouvenirPdf()
    if (result === 'ok') flashToast('Souvenir prêt à imprimer / PDF', 'ok')
    else if (result === 'blocked') {
      flashToast('Autorise les pop-ups pour le souvenir', 'error')
    } else flashToast('Capture impossible — ouvre la scène d’abord', 'error')
    setMoreOpen(false)
  }

  const handleToggleParent = () => {
    if (!parentLock) {
      if (
        !window.confirm(
          'Activer le mode parent ? La boîte à meubles et les modèles seront verrouillés.',
        )
      ) {
        return
      }
      setParentLock(true)
    } else {
      setParentLock(false)
    }
    setMoreOpen(false)
  }

  const handleShareLink = () => {
    onOpenShareQr()
    setMoreOpen(false)
  }

  const applyHouseFile = (file: Parameters<typeof houseFileToRooms>[0]) => {
    clearImportWarnings()
    replaceHouse(houseFileToRooms(file), file.activeRoom)
    if (file.title) setRoomTitle(file.title)
    clearPending()
    select(null)
  }

  const handleCloudSave = () => {
    const name =
      window.prompt('Nom de la sauvegarde cloud (sur cet appareil) ?', 'Ma maison') ??
      ''
    if (!name.trim()) return
    saveToCloud(name, serializeHouseFromState(useRoomStore.getState()))
    flashToast('Maison sauvegardée (cloud local)', 'ok')
    setMoreOpen(false)
  }

  const handleCloudLoad = () => {
    if (parentLock) {
      flashToast('Mode parent : ouverture verrouillée', 'error')
      return
    }
    const saves = listCloudSaves()
    if (saves.length === 0) {
      flashToast('Aucune sauvegarde cloud', 'info')
      return
    }
    const list = saves
      .map(
        (s, i) =>
          `${i + 1}. ${s.name} (${new Date(s.savedAt).toLocaleDateString('fr-FR')})`,
      )
      .join('\n')
    const pick = window.prompt(
      `Quelle sauvegarde ouvrir ?\n${list}\n\nNuméro :`,
      '1',
    )
    const index = Number(pick) - 1
    const save = saves[index]
    if (!save) return
    if (
      !window.confirm(
        `Ouvrir « ${save.name} » ? Toute la maison actuelle sera remplacée.`,
      )
    ) {
      return
    }
    const loaded = loadCloudSave(save.id)
    if (!loaded) return
    applyHouseFile(loaded.file)
    flashToast('Maison ouverte', 'ok')
    setMoreOpen(false)
  }

  const handleCloudDelete = () => {
    const saves = listCloudSaves()
    if (saves.length === 0) {
      flashToast('Aucune sauvegarde cloud', 'info')
      return
    }
    const list = saves.map((s, i) => `${i + 1}. ${s.name}`).join('\n')
    const pick = window.prompt(`Supprimer quelle sauvegarde ?\n${list}\n\nNuméro :`)
    const index = Number(pick) - 1
    const save = saves[index]
    if (!save) return
    deleteCloudSave(save.id)
    flashToast('Sauvegarde supprimée', 'info')
  }

  const handleExport = () => {
    downloadBedroomFile(serializeHouseFromState(useRoomStore.getState()))
    flashToast('Maison exportée', 'ok')
    setMoreOpen(false)
  }

  const handleImportClick = () => {
    if (parentLock) {
      flashToast('Mode parent : ouverture verrouillée', 'error')
      return
    }
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const result = await readHouseFile(file)
    if (!result.ok) {
      window.alert(result.error)
      return
    }

    if (
      !window.confirm(
        'Ouvrir ce plan ? Toute la maison actuelle sera remplacée.',
      )
    ) {
      return
    }

    applyHouseFile(result.file)
    flashToast('Maison ouverte', 'ok')
    setMoreOpen(false)
  }

  const wallAndViewTools = (
    <>
      <div className="mode-toggle" role="group" aria-label="Murs">
        {WALL_OPTIONS.map(({ mode: m, label }) => (
          <button
            key={m}
            type="button"
            className={
              wallMode === m
                ? 'mode-toggle-btn mode-toggle-btn--active'
                : 'mode-toggle-btn'
            }
            aria-pressed={wallMode === m}
            onClick={() => setWallMode(m)}
            title="Murs coupés, masqués ou complets — comme dans les jeux de déco"
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => toggleCurtains()}
        aria-pressed={curtainsOpen}
        title="Ouvre ou ferme les rideaux"
        disabled={wallMode !== 'full'}
      >
        {curtainsOpen ? 'Rideaux ouverts' : 'Rideaux fermés'}
      </button>
      <button
        type="button"
        className={
          showGrid ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
        }
        onClick={() => toggleShowGrid()}
        aria-pressed={showGrid}
        title="Afficher ou cacher la grille (G)"
      >
        Grille
      </button>
    </>
  )

  const comfortTools = (
    <>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => setShadowQuality(nextShadowQuality(shadowQuality))}
        title="Qualité des ombres (perf tablette)"
      >
        {shadowQualityLabel(shadowQuality)}
      </button>
      <button
        type="button"
        className={soundOn ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'}
        onClick={() => setSoundOn(!soundOn)}
        aria-pressed={soundOn}
        title="Sons (pose & défis)"
      >
        {soundOn ? 'Sons' : 'Muet'}
      </button>
      <button
        type="button"
        className={musicOn ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'}
        onClick={() => setMusicOn(!musicOn)}
        aria-pressed={musicOn}
        title="Musique douce"
      >
        Musique
      </button>
      <button
        type="button"
        className={
          parentLock ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
        }
        onClick={handleToggleParent}
        aria-pressed={parentLock}
        title="Verrouille la boîte à meubles"
      >
        {parentLock ? 'Parent ✓' : 'Parent'}
      </button>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => void handleSouvenirPdf()}
        title="Souvenir imprimable / PDF"
      >
        Souvenir
      </button>
      <button
        type="button"
        className={bigFingers ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'}
        onClick={() => setBigFingers(!bigFingers)}
        aria-pressed={bigFingers}
        title="Gros doigts — boutons plus grands"
      >
        Gros doigts
      </button>
      <button
        type="button"
        className={
          highContrast ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
        }
        onClick={() => setHighContrast(!highContrast)}
        aria-pressed={highContrast}
        title="Contraste fort"
      >
        Contraste
      </button>
    </>
  )

  const fileTools = (
    <>
      <button type="button" className="top-bar-btn" onClick={handleEmptyPreset}>
        Chambre vide
      </button>
      <button
        type="button"
        className="top-bar-btn top-bar-btn--primary"
        onClick={handleShareLink}
        title="QR code et lien vers ta chambre"
      >
        Lien
      </button>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => {
          onOpenCoPlay()
          setMoreOpen(false)
        }}
        title="Décorer ensemble en direct"
      >
        Co-déco
      </button>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => {
          onOpenGallery()
          setMoreOpen(false)
        }}
        title="Galerie de chambres"
      >
        Galerie
      </button>
      <button type="button" className="top-bar-btn" onClick={handleCloudSave}>
        Cloud ↓
      </button>
      <button type="button" className="top-bar-btn" onClick={handleCloudLoad}>
        Cloud ↑
      </button>
      <button type="button" className="top-bar-btn" onClick={handleCloudDelete}>
        Cloud ✕
      </button>
      <button type="button" className="top-bar-btn" onClick={handleExport}>
        Sauver
      </button>
      <button type="button" className="top-bar-btn" onClick={handleImportClick}>
        Ouvrir
      </button>
    </>
  )

  return (
    <header className={coarse ? 'top-bar top-bar--tablet' : 'top-bar'}>
      <div className="top-bar-row">
        <div className="top-bar-leading">
          <div className="brand-block">
            <div className="brand-mark">
              <span className="brand-badge" aria-hidden />
              <h1 className="top-bar-title">Mini Déco</h1>
            </div>
            {!coarse ? (
              <button
                type="button"
                className="room-title-btn"
                onClick={handleRenameRoom}
                title="Renommer la chambre"
              >
                {roomTitle}
              </button>
            ) : (
              <button
                type="button"
                className="room-title-btn room-title-btn--compact"
                onClick={handleRenameRoom}
                title="Renommer la chambre"
              >
                {roomTitle}
              </button>
            )}
          </div>
          <div
            className="mode-toggle"
            role="group"
            aria-label="Mode d’interaction"
          >
            <button
              type="button"
              className={
                !placing
                  ? 'mode-toggle-btn mode-toggle-btn--active'
                  : 'mode-toggle-btn'
              }
              aria-pressed={!placing}
              onClick={exitPlace}
            >
              Regarder
            </button>
            <button
              type="button"
              className={
                placing
                  ? 'mode-toggle-btn mode-toggle-btn--active'
                  : 'mode-toggle-btn'
              }
              aria-pressed={placing}
              disabled={!hasPending && !placing}
              title={
                hasPending || placing
                  ? 'Mode placer — un doigt pose · deux doigts = caméra · Tourner dans le dock'
                  : 'Choisis d’abord un meuble dans la boîte'
              }
            >
              Placer
            </button>
          </div>
          <div className="mode-toggle" role="group" aria-label="Vue">
            <button
              type="button"
              className={
                viewMode === 'dollhouse'
                  ? 'mode-toggle-btn mode-toggle-btn--active'
                  : 'mode-toggle-btn'
              }
              aria-pressed={viewMode === 'dollhouse'}
              onClick={() => setViewMode('dollhouse')}
              title="Vue maison de poupée (¾)"
            >
              3D
            </button>
            <button
              type="button"
              className={
                viewMode === 'plan'
                  ? 'mode-toggle-btn mode-toggle-btn--active'
                  : 'mode-toggle-btn'
              }
              aria-pressed={viewMode === 'plan'}
              onClick={() => setViewMode('plan')}
              title="Vue plan depuis le dessus"
            >
              Plan
            </button>
          </div>
          {hasPending && (
            <button
              type="button"
              className="top-bar-btn top-bar-btn--cancel"
              onClick={() => useRoomStore.getState().cancelInteraction()}
              title="Lâcher l’objet"
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => undo()}
            disabled={!canUndo}
            title="Annuler le dernier geste (⌘Z)"
          >
            ↩ Undo
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => requestCameraHome()}
            title="Recentrer la caméra (H)"
          >
            Recentrer
          </button>
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            onClick={() => setPhotoMode(true)}
            title="Mode photo"
          >
            Photo
          </button>
          {!coarse && wallAndViewTools}
        </div>
        <div className="top-bar-actions">
          {importWarnings.length > 0 && (
            <p className="top-bar-warning" role="status">
              {importWarnings.join(' · ')}
            </p>
          )}
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            onClick={handleLouisePreset}
          >
            Modèle Louise
          </button>
          <button type="button" className="top-bar-btn" onClick={handleSalonPreset}>
            Salon cosy
          </button>
          {coarse ? (
            <div className="top-bar-more">
              <button
                type="button"
                className={
                  moreOpen
                    ? 'top-bar-btn top-bar-btn--primary'
                    : 'top-bar-btn'
                }
                aria-expanded={moreOpen}
                aria-controls="top-bar-more-panel"
                onClick={() => setMoreOpen((o) => !o)}
              >
                Plus…
              </button>
              {moreOpen && (
                <div
                  id="top-bar-more-panel"
                  className="top-bar-more-panel"
                  role="group"
                  aria-label="Plus d’options"
                >
                  {wallAndViewTools}
                  {comfortTools}
                  {fileTools}
                </div>
              )}
            </div>
          ) : (
            <>
              {comfortTools}
              {fileTools}
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.bedroom.json,application/json"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>
      <CoachTip />
    </header>
  )
}
