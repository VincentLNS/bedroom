import { captureScenePng } from '../scene/capture'
import { useRoomStore } from '../store/roomStore'

/** HUD overlay for photo mode — frame + download PNG. */
export function PhotoModeOverlay() {
  const photoMode = useRoomStore((s) => s.photoMode)
  const setPhotoMode = useRoomStore((s) => s.setPhotoMode)
  const markChallengeDone = useRoomStore((s) => s.markChallengeDone)
  const flashToast = useRoomStore((s) => s.flashToast)

  if (!photoMode) return null

  const capture = () => {
    const url = captureScenePng()
    if (!url) {
      flashToast('Impossible de capturer', 'error')
      return
    }
    const link = document.createElement('a')
    link.download = `mini-deco-${Date.now()}.png`
    link.href = url
    link.click()
    markChallengeDone('photo-smile')
    flashToast('Photo enregistrée !', 'ok')
  }

  return (
    <div className="photo-mode" role="dialog" aria-label="Mode photo">
      <div className="photo-mode-frame" aria-hidden />
      <div className="photo-mode-bar">
        <button
          type="button"
          className="top-bar-btn"
          onClick={() => setPhotoMode(false)}
        >
          Fermer
        </button>
        <button
          type="button"
          className="top-bar-btn top-bar-btn--primary"
          onClick={capture}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
