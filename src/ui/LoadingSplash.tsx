import { useEffect, useState } from 'react'

type Props = {
  ready: boolean
}

/** Soft brand splash while the 3D room boots. */
export function LoadingSplash({ ready }: Props) {
  const [hide, setHide] = useState(false)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    if (ready) {
      setProgress(100)
      const t = window.setTimeout(() => setHide(true), 420)
      return () => window.clearTimeout(t)
    }
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 88 ? p : p + 4 + Math.random() * 6))
    }, 180)
    return () => window.clearInterval(id)
  }, [ready])

  if (hide) return null

  return (
    <div
      className={`loading-splash${ready ? ' loading-splash--out' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={!ready}
    >
      <div className="loading-splash-card">
        <div className="loading-splash-badge" aria-hidden />
        <p className="loading-splash-brand">Mini Déco</p>
        <p className="loading-splash-msg">
          {ready ? 'Ta chambre est prête !' : 'On prépare la chambre…'}
        </p>
        <div className="loading-splash-bar" aria-hidden>
          <div
            className="loading-splash-bar-fill"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
