import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  buildShareUrl,
  copyText,
  shareOrCopyUrl,
} from '../persist/shareLink'
import { serializeHouseFromState, serializeLayout } from '../persist'
import { useRoomStore } from '../store/roomStore'

type Props = {
  open: boolean
  onClose: () => void
}

type ShareMode = 'house' | 'room'

/** QR scanners struggle past ~2.5k chars — fall back to room-only. */
const QR_SOFT_LIMIT = 2400

export function ShareQrModal({ open, onClose }: Props) {
  const flashToast = useRoomStore((s) => s.flashToast)
  const markChallengeDone = useRoomStore((s) => s.markChallengeDone)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<ShareMode>('house')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    setNote(null)
    void (async () => {
      try {
        const state = useRoomStore.getState()
        let shareUrl: string
        let usedMode: ShareMode = mode

        if (mode === 'house') {
          shareUrl = await buildShareUrl(serializeHouseFromState(state))
          if (shareUrl.length > QR_SOFT_LIMIT) {
            shareUrl = await buildShareUrl(serializeLayout(state.items))
            usedMode = 'room'
            if (!cancelled) {
              setNote('Maison trop grande pour le QR — lien de la pièce seule.')
            }
          }
        } else {
          shareUrl = await buildShareUrl(serializeLayout(state.items))
        }

        if (cancelled) return
        setUrl(shareUrl)
        if (usedMode !== mode && mode === 'house') {
          /* note already set */
        }
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, shareUrl, {
            width: 220,
            margin: 2,
            color: { dark: '#1f3a45', light: '#fffdf7' },
            errorCorrectionLevel: shareUrl.length > 1200 ? 'M' : 'H',
          })
        }
      } catch {
        if (!cancelled) {
          flashToast('Lien trop long — retire des meubles', 'error')
          setUrl('')
        }
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, mode, flashToast])

  if (!open) return null

  const finishShare = (msg: string) => {
    markChallengeDone('share-room')
    flashToast(msg, 'ok')
  }

  return (
    <div
      className="magic-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="magic-modal"
        role="dialog"
        aria-label="Partager la maison"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Partage ta maison</h2>
        <p className="magic-modal-hint">
          Scanne le QR avec une autre tablette, ou copie le lien.
        </p>
        <div className="share-mode-row" role="group" aria-label="Quoi partager">
          <button
            type="button"
            className={
              mode === 'house'
                ? 'top-bar-btn top-bar-btn--primary'
                : 'top-bar-btn'
            }
            onClick={() => setMode('house')}
          >
            Maison
          </button>
          <button
            type="button"
            className={
              mode === 'room'
                ? 'top-bar-btn top-bar-btn--primary'
                : 'top-bar-btn'
            }
            onClick={() => setMode('room')}
          >
            Pièce seule
          </button>
        </div>
        <div className="share-qr-wrap">
          <canvas ref={canvasRef} className="share-qr-canvas" />
          {busy && <p className="share-qr-loading">Préparation…</p>}
        </div>
        {note && <p className="share-qr-note">{note}</p>}
        <p className="share-qr-url" title={url}>
          {url ? `${url.slice(0, 42)}…` : '—'}
        </p>
        <div className="magic-modal-actions">
          <button type="button" className="top-bar-btn" onClick={onClose}>
            Fermer
          </button>
          <button
            type="button"
            className="top-bar-btn"
            disabled={!url}
            onClick={async () => {
              const ok = await copyText(url)
              if (ok) finishShare('Lien copié !')
              else flashToast('Copie impossible', 'error')
            }}
          >
            Copier
          </button>
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            disabled={!url}
            onClick={async () => {
              const result = await shareOrCopyUrl(url)
              if (result === 'shared' || result === 'copied') {
                finishShare(
                  result === 'shared' ? 'Lien partagé !' : 'Lien copié !',
                )
              } else flashToast('Partage annulé', 'info')
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
