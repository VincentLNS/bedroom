import { captureScenePng } from '../scene/capture'
import { useRoomStore } from '../store/roomStore'

async function sharePng(dataUrl: string): Promise<boolean> {
  try {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], `mini-deco-${Date.now()}.png`, {
      type: 'image/png',
    })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Mini Déco',
        text: 'Ma chambre Mini Déco ✨',
      })
      return true
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return false
  }
  return false
}

function downloadPng(dataUrl: string) {
  const link = document.createElement('a')
  link.download = `mini-deco-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}

/** HUD overlay for photo mode — frame + download / share PNG. */
export function PhotoModeOverlay() {
  const photoMode = useRoomStore((s) => s.photoMode)
  const setPhotoMode = useRoomStore((s) => s.setPhotoMode)
  const markChallengeDone = useRoomStore((s) => s.markChallengeDone)
  const flashToast = useRoomStore((s) => s.flashToast)

  if (!photoMode) return null

  const finish = (msg: string) => {
    markChallengeDone('photo-smile')
    flashToast(msg, 'ok')
  }

  const capture = async (mode: 'save' | 'share') => {
    const url = captureScenePng()
    if (!url) {
      flashToast('Impossible de capturer', 'error')
      return
    }
    if (mode === 'share') {
      const shared = await sharePng(url)
      if (shared) {
        finish('Photo envoyée !')
        return
      }
      downloadPng(url)
      finish('Photo enregistrée (partage indisponible)')
      return
    }
    downloadPng(url)
    finish('Photo enregistrée !')
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
          className="top-bar-btn"
          onClick={() => void capture('share')}
        >
          Envoyer
        </button>
        <button
          type="button"
          className="top-bar-btn top-bar-btn--primary"
          onClick={() => void capture('save')}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
