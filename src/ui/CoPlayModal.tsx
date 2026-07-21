import { useState } from 'react'
import {
  leaveCoPlaySalon,
  startCoPlayGuest,
  startCoPlayHost,
} from '../coplay/session'
import { useCoPlayPresence } from '../coplay/useCoPlayPresence'
import { useRoomStore } from '../store/roomStore'

type Props = {
  open: boolean
  onClose: () => void
}

export function CoPlayModal({ open, onClose }: Props) {
  const flashToast = useRoomStore((s) => s.flashToast)
  const { mode, code, joinCode, status, connected, waiting } = useCoPlayPresence()
  const [joinInput, setJoinInput] = useState(joinCode)

  if (!open) return null

  return (
    <div className="magic-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="magic-modal"
        role="dialog"
        aria-label="Co-déco"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Co-déco en direct</h2>
        <p className="magic-modal-hint">
          Beta · code court à 4 caractères · même Wi‑Fi recommandé.
        </p>
        <p className="magic-modal-hint" aria-live="polite">
          {status}
        </p>
        {connected && (
          <p className="coplay-live" role="status">
            ● En direct
          </p>
        )}

        {mode === 'idle' && (
          <div className="magic-modal-actions magic-modal-actions--stack">
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={() => startCoPlayHost()}
            >
              Créer un salon
            </button>
            <div className="coplay-join">
              <input
                className="coplay-input"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                placeholder="Ex. AB12"
                aria-label="Code co-déco"
                maxLength={12}
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button
                type="button"
                className="top-bar-btn"
                onClick={() => startCoPlayGuest(joinInput)}
              >
                Rejoindre
              </button>
            </div>
          </div>
        )}

        {mode === 'host' && code && (
          <p className="coplay-code" aria-live="polite">
            Code : <strong className="coplay-code-big">{code}</strong>
          </p>
        )}

        <div className="magic-modal-actions">
          <button type="button" className="top-bar-btn" onClick={onClose}>
            {connected || waiting
              ? 'Continuer (garder le lien)'
              : 'Fermer'}
          </button>
          {mode === 'host' && code && (
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code)
                  flashToast('Code copié', 'ok')
                } catch {
                  flashToast('Copie impossible', 'error')
                }
              }}
            >
              Copier le code
            </button>
          )}
          {mode === 'host' && !connected && (
            <button
              type="button"
              className="top-bar-btn"
              onClick={() => startCoPlayHost()}
            >
              Relancer le salon
            </button>
          )}
          {mode === 'guest' && !connected && (
            <button
              type="button"
              className="top-bar-btn"
              onClick={() => startCoPlayGuest(joinInput || joinCode)}
            >
              Réessayer
            </button>
          )}
          {mode !== 'idle' && (
            <button
              type="button"
              className="top-bar-btn"
              onClick={() => {
                leaveCoPlaySalon()
                setJoinInput('')
              }}
            >
              Quitter le salon
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
