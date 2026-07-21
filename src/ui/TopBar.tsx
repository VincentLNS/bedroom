import { useEffect, useState } from 'react'
import { useRoomStore, type WallMode } from '../store/roomStore'
import { CoachTip } from './CoachTip'
import { useCoarsePointer } from './useCoarsePointer'
import { usePhoneLayout } from './usePhoneLayout'
import { askPrompt } from './dialogStore'
import { requireParentAccess } from './parentGate'

const WALL_OPTIONS: { mode: WallMode; label: string }[] = [
  { mode: 'cut', label: 'Coupés' },
  { mode: 'hidden', label: 'Sans' },
  { mode: 'full', label: 'Complets' },
]

type TopBarProps = {
  onOpenShareQr: () => void
  onOpenGallery: () => void
  onOpenParent: () => void
}

export function TopBar({
  onOpenShareQr,
  onOpenGallery,
  onOpenParent,
}: TopBarProps) {
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
  const flashToast = useRoomStore((s) => s.flashToast)
  const roomTitle = useRoomStore((s) => s.roomTitle)
  const setRoomTitle = useRoomStore((s) => s.setRoomTitle)
  const soundOn = useRoomStore((s) => s.soundOn)
  const setSoundOn = useRoomStore((s) => s.setSoundOn)
  const musicOn = useRoomStore((s) => s.musicOn)
  const setMusicOn = useRoomStore((s) => s.setMusicOn)
  const parentLock = useRoomStore((s) => s.parentLock)
  const importWarnings = useRoomStore((s) => s.importWarnings)
  const coarse = useCoarsePointer()
  const phone = usePhoneLayout()
  const compact = coarse || phone
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    if (photoMode) return
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
  }, [photoMode])

  if (photoMode) return null

  const placing = mode === 'place'
  const hasPending = pendingCatalogId != null

  const exitPlace = () => {
    useRoomStore.getState().cancelInteraction()
  }

  const handleRenameRoom = async () => {
    const next = await askPrompt({
      title: 'Nom de la chambre',
      defaultValue: roomTitle,
      confirmLabel: 'Renommer',
    })
    if (!next) return
    setRoomTitle(next)
    flashToast('Chambre renommée !', 'ok')
  }

  const handleOpenParent = async () => {
    const ok = await requireParentAccess()
    if (!ok) return
    onOpenParent()
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
            title="Murs coupés, masqués ou complets"
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

  const playTools = (
    <>
      <button
        type="button"
        className={soundOn ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'}
        onClick={() => setSoundOn(!soundOn)}
        aria-pressed={soundOn}
        title="Sons"
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
        className="top-bar-btn top-bar-btn--primary"
        onClick={() => {
          onOpenShareQr()
          setMoreOpen(false)
        }}
        title="QR et lien de la pièce active"
      >
        Lien
      </button>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => {
          onOpenGallery()
          setMoreOpen(false)
        }}
        title="Modèles et souvenirs sur cet appareil"
      >
        Modèles
      </button>
      <button
        type="button"
        className={
          parentLock ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
        }
        onClick={() => void handleOpenParent()}
        title="Espace parent (code requis)"
      >
        {parentLock ? 'Parents ✓' : 'Parents'}
      </button>
    </>
  )

  const sceneTools = (
    <>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => {
          undo()
          setMoreOpen(false)
        }}
        disabled={!canUndo}
        title="Annuler le dernier geste (⌘Z)"
      >
        ↩ Undo
      </button>
      <button
        type="button"
        className="top-bar-btn"
        onClick={() => {
          requestCameraHome()
          setMoreOpen(false)
        }}
        title="Recentrer la caméra (H)"
      >
        Recentrer
      </button>
      <button
        type="button"
        className="top-bar-btn top-bar-btn--primary"
        onClick={() => {
          setPhotoMode(true)
          setMoreOpen(false)
        }}
        title="Mode photo"
      >
        Photo
      </button>
    </>
  )

  const topBarClass = [
    'top-bar',
    phone ? 'top-bar--phone' : '',
    compact && !phone ? 'top-bar--tablet' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={topBarClass}>
      <div className="top-bar-row">
        <div className="top-bar-leading">
          <div className="brand-block">
            <div className="brand-mark">
              <span className="brand-badge" aria-hidden />
              <h1 className="top-bar-title">Mini Déco</h1>
            </div>
            {!phone && (
              <button
                type="button"
                className={
                  compact
                    ? 'room-title-btn room-title-btn--compact'
                    : 'room-title-btn'
                }
                onClick={() => void handleRenameRoom()}
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
              {phone ? 'Voir' : 'Regarder'}
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
                  ? 'Mode placer — un doigt pose · deux doigts = caméra'
                  : 'Choisis d’abord un meuble dans la boîte'
              }
            >
              {phone ? 'Poser' : 'Placer'}
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
              {phone ? '✕' : 'Annuler'}
            </button>
          )}
          {!phone && (
            <>
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
            </>
          )}
          {!compact && wallAndViewTools}
        </div>
        <div className="top-bar-actions">
          {importWarnings.length > 0 && (
            <p className="top-bar-warning" role="status">
              {importWarnings.join(' · ')}
            </p>
          )}
          {compact ? (
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
                  {phone && sceneTools}
                  {wallAndViewTools}
                  {playTools}
                  {phone && (
                    <button
                      type="button"
                      className="top-bar-btn"
                      onClick={() => void handleRenameRoom()}
                      title="Renommer la chambre"
                    >
                      Nom
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            playTools
          )}
        </div>
      </div>
      <CoachTip activeOnly={phone} />
    </header>
  )
}
