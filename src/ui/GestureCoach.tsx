import { useEffect, useState } from 'react'

const STORAGE_KEY = 'minideco-gesture-coach-v1'

const STEPS = [
  {
    title: 'Un doigt pour poser',
    body: 'Choisis un meuble dans la boîte, puis appuie dans la chambre (ou le jardin).',
  },
  {
    title: 'Deux doigts pour regarder',
    body: 'Même en mode Placer : deux doigts font tourner et zoomer la caméra.',
  },
  {
    title: 'Annuler sans clavier',
    body: 'Bouton Annuler, ↩ Annuler le dernier geste, ou tape à deux doigts.',
  },
] as const

export function GestureCoach() {
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'done') return
    } catch {
      /* private mode */
    }
    setStep(0)
  }, [])

  if (step === null) return null

  const current = STEPS[step]
  const isLast = step >= STEPS.length - 1

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'done')
    } catch {
      /* ignore */
    }
    setStep(null)
  }

  return (
    <div className="gesture-coach" role="dialog" aria-label="Tutoriel gestes">
      <div className="gesture-coach-card">
        <p className="gesture-coach-step">
          {step + 1} / {STEPS.length}
        </p>
        <h2 className="gesture-coach-title">{current.title}</h2>
        <p className="gesture-coach-body">{current.body}</p>
        <div className="gesture-coach-actions">
          <button type="button" className="top-bar-btn" onClick={finish}>
            Passer
          </button>
          {isLast ? (
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={finish}
            >
              C’est parti !
            </button>
          ) : (
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={() => setStep(step + 1)}
            >
              Suivant
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
