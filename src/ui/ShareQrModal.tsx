import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { buildShareUrl, copyText, shareOrCopyUrl } from '../persist/shareLink'
import { serializeLayout } from '../persist'
import { useRoomStore } from '../store/roomStore'

type Props = {
  open: boolean
  onClose: () => void
}

export function ShareQrModal({ open, onClose }: Props) {
  const items = useRoomStore((s) => s.items)
  const flashToast = useRoomStore((s) => s.flashToast)
  const markChallengeDone = useRoomStore((s) => s.markChallengeDone)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setBusy(true)
    void (async () => {
      try {
        const shareUrl = await buildShareUrl(serializeLayout(items))
        if (cancelled) return
        setUrl(shareUrl)
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, shareUrl, {
            width: 220,
            margin: 2,
            color: { dark: '#1f3a45', light: '#fffdf7' },
          })
        }
      } catch {
        if (!cancelled) flashToast('Lien trop long — retire des meubles', 'error')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, items, flashToast])

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
        aria-label="Partager la chambre"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Partage ta chambre</h2>
        <p className="magic-modal-hint">
          Scanne le QR avec une autre tablette, ou copie le lien.
        </p>
        <div className="share-qr-wrap">
          <canvas ref={canvasRef} className="share-qr-canvas" />
          {busy && <p className="share-qr-loading">Préparation…</p>}
        </div>
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
                finishShare(result === 'shared' ? 'Lien partagé !' : 'Lien copié !')
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
