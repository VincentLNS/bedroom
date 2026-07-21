import { useEffect, useState } from 'react'
import { useDialogStore } from './dialogStore'

/** Kid-safe dialogs replacing window.confirm / prompt / alert. */
export function DialogHost() {
  const current = useDialogStore((s) => s.current)
  const clear = useDialogStore((s) => s.clear)

  useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      if (current.kind === 'confirm') current.resolve(false)
      else if (
        current.kind === 'prompt' ||
        current.kind === 'pick' ||
        current.kind === 'pin'
      ) {
        current.resolve(null)
      } else current.resolve()
      clear()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [current, clear])

  if (!current) return null

  const dismiss = () => {
    if (current.kind === 'confirm') current.resolve(false)
    else if (
      current.kind === 'prompt' ||
      current.kind === 'pick' ||
      current.kind === 'pin'
    ) {
      current.resolve(null)
    } else current.resolve()
    clear()
  }

  return (
    <div className="magic-modal-backdrop" role="presentation" onClick={dismiss}>
      <div
        className="magic-modal"
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">{current.title}</h2>
        {current.kind !== 'prompt' && current.kind !== 'pin' && 'message' in current && (
          <p className="magic-modal-hint">{current.message}</p>
        )}
        {current.kind === 'prompt' && current.message && (
          <p className="magic-modal-hint">{current.message}</p>
        )}
        {current.kind === 'pin' && current.message && (
          <p className="magic-modal-hint">{current.message}</p>
        )}

        {current.kind === 'confirm' && (
          <div className="magic-modal-actions">
            <button type="button" className="top-bar-btn" onClick={dismiss}>
              {current.cancelLabel ?? 'Annuler'}
            </button>
            <button
              type="button"
              className={
                current.danger
                  ? 'top-bar-btn top-bar-btn--cancel'
                  : 'top-bar-btn top-bar-btn--primary'
              }
              onClick={() => {
                current.resolve(true)
                clear()
              }}
            >
              {current.confirmLabel ?? 'OK'}
            </button>
          </div>
        )}

        {current.kind === 'alert' && (
          <div className="magic-modal-actions">
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={() => {
                current.resolve()
                clear()
              }}
            >
              {current.confirmLabel ?? 'OK'}
            </button>
          </div>
        )}

        {current.kind === 'prompt' && (
          <PromptBody
            defaultValue={current.defaultValue ?? ''}
            placeholder={current.placeholder}
            confirmLabel={current.confirmLabel ?? 'OK'}
            onCancel={dismiss}
            onConfirm={(value) => {
              current.resolve(value)
              clear()
            }}
          />
        )}

        {current.kind === 'pick' && (
          <div className="dialog-pick-list">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="dialog-pick-item"
                onClick={() => {
                  current.resolve(opt.id)
                  clear()
                }}
              >
                <span className="dialog-pick-label">{opt.label}</span>
                {opt.meta && (
                  <span className="dialog-pick-meta">{opt.meta}</span>
                )}
              </button>
            ))}
            <div className="magic-modal-actions">
              <button type="button" className="top-bar-btn" onClick={dismiss}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {current.kind === 'pin' && (
          <PinPad
            mode={current.mode}
            onCancel={dismiss}
            onComplete={(pin) => {
              current.resolve(pin)
              clear()
            }}
          />
        )}
      </div>
    </div>
  )
}

function PromptBody({
  defaultValue,
  placeholder,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  defaultValue: string
  placeholder?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: (value: string | null) => void
}) {
  const [value, setValue] = useState(defaultValue)
  return (
    <>
      <input
        className="coplay-input dialog-prompt-input"
        value={value}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const trimmed = value.trim()
            onConfirm(trimmed || null)
          }
        }}
      />
      <div className="magic-modal-actions">
        <button type="button" className="top-bar-btn" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="button"
          className="top-bar-btn top-bar-btn--primary"
          onClick={() => {
            const trimmed = value.trim()
            onConfirm(trimmed || null)
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  )
}

function PinPad({
  mode,
  onCancel,
  onComplete,
}: {
  mode: 'set' | 'unlock'
  onCancel: () => void
  onComplete: (pin: string) => void
}) {
  const [digits, setDigits] = useState('')
  const [confirmDigits, setConfirmDigits] = useState<string | null>(null)
  const [error, setError] = useState('')

  const targetLen = 4
  const active = confirmDigits === null ? digits : confirmDigits
  const label =
    mode === 'set'
      ? confirmDigits === null
        ? 'Choisis 4 chiffres'
        : 'Encore une fois'
      : 'Code parent'

  const push = (d: string) => {
    setError('')
    const next = (active + d).slice(0, targetLen)
    if (confirmDigits === null) setDigits(next)
    else setConfirmDigits(next)

    if (next.length < targetLen) return

    if (mode === 'unlock') {
      onComplete(next)
      return
    }

    if (confirmDigits === null) {
      setConfirmDigits('')
      return
    }

    if (next !== digits) {
      setError('Les codes ne correspondent pas')
      setDigits('')
      setConfirmDigits(null)
      return
    }
    onComplete(next)
  }

  const backspace = () => {
    setError('')
    if (confirmDigits !== null) {
      setConfirmDigits(confirmDigits.slice(0, -1))
    } else {
      setDigits(digits.slice(0, -1))
    }
  }

  return (
    <div className="pin-pad">
      <p className="pin-pad-label">{label}</p>
      <div className="pin-pad-dots" aria-hidden>
        {Array.from({ length: targetLen }, (_, i) => (
          <span
            key={i}
            className={
              i < active.length ? 'pin-pad-dot pin-pad-dot--on' : 'pin-pad-dot'
            }
          />
        ))}
      </div>
      {error && <p className="pin-pad-error">{error}</p>}
      <div className="pin-pad-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map(
          (key, i) => {
            if (key === '') {
              return <span key={`spacer-${i}`} className="pin-pad-spacer" />
            }
            return (
              <button
                key={key}
                type="button"
                className="pin-pad-key"
                onClick={() => (key === '⌫' ? backspace() : push(key))}
              >
                {key}
              </button>
            )
          },
        )}
      </div>
      <div className="magic-modal-actions">
        <button type="button" className="top-bar-btn" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  )
}
