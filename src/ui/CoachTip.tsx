import { useMemo } from 'react'
import { getCatalogItem } from '../catalog'
import { useRoomStore } from '../store/roomStore'
import { usePhoneLayout } from './usePhoneLayout'

const TIPS = [
  'Laisse toujours un chemin libre devant la porte pour entrer !',
  'Les petites peluches peuvent s’asseoir sur le lit.',
  'Le bureau aime la lumière : place-le près de la fenêtre.',
  'Tourne avec le bouton ↻ en bas — ou clic droit / R sur ordi.',
  'Deux doigts = caméra, même en mode Placer. Un doigt = poser.',
  '↩ Undo annule la dernière pose. Tape à deux doigts aussi !',
  'Passe en « Sans » murs pour voir toute la chambre comme une maison de poupée.',
  'La vue Plan (depuis le dessus) aide à bien ranger.',
  'Un tapis au centre aide à organiser l’espace.',
  'Range les jouets sur le coffre ou le Trofast.',
  'Trop de meubles collés = chambre étouffée. Respire !',
  'Recentrer remet la belle vue maison de poupée.',
  'Les animaux aiment le jardin : pose-les sur la pelouse autour de la chambre !',
]

export function CoachTip({ activeOnly = false }: { activeOnly?: boolean }) {
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const selectedId = useRoomStore((s) => s.selectedId)
  const items = useRoomStore((s) => s.items)
  const viewMode = useRoomStore((s) => s.viewMode)

  const active = pendingCatalogId != null || selectedId != null

  const tip = useMemo(() => {
    if (pendingCatalogId) {
      const item = getCatalogItem(pendingCatalogId)
      if (item?.outdoor) {
        return `Tu places « ${item.name} » — chambre ou jardin · ↻ Tourner · Annuler pour lâcher.`
      }
      if (item?.nestable) {
        return `Tu places « ${item.name} » — sol ou meuble · ↻ Tourner · deux doigts = caméra.`
      }
      if (item) {
        return `Tu places « ${item.name} » — un doigt pose · ↻ tourne · Annuler lâche.`
      }
      return 'Appuie dans la chambre pour poser · Annuler pour lâcher.'
    }
    if (selectedId) {
      return 'Meuble choisi ! ↻ Tourner · glisse pour déplacer · Enlever · ↩ Undo.'
    }
    if (viewMode === 'plan') {
      return 'Vue Plan : tu regardes d’en haut — parfait pour placer juste. Repasse en 3D pour admirer.'
    }
    if (mode === 'orbit' && items.length === 0) {
      return 'Chambre vide : choisis un meuble dans la boîte à gauche pour commencer.'
    }
    return TIPS[items.length % TIPS.length]
  }, [mode, pendingCatalogId, selectedId, items.length, viewMode])

  if (activeOnly && !active) return null

  return (
    <div
      className={activeOnly && active ? 'coach-tip coach-tip--active' : 'coach-tip'}
      role="status"
      aria-live="polite"
    >
      <span className="coach-tip-label">Astuce déco</span>
      <p className="coach-tip-text">{tip}</p>
    </div>
  )
}

/** Tiny floating label over the 3D scene — quiet on phones. */
export function SceneHud() {
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const selectedId = useRoomStore((s) => s.selectedId)
  const viewMode = useRoomStore((s) => s.viewMode)
  const canUndo = useRoomStore((s) => s.undoStack.length > 0)
  const phone = usePhoneLayout()

  let label = viewMode === 'plan' ? 'Vue plan' : 'Regarde ta chambre'
  let tone = 'idle'
  if (pendingCatalogId || mode === 'place') {
    label = phone ? 'Poser · 2 doigts = caméra' : 'Mode placer · 2 doigts = caméra'
    tone = 'place'
  } else if (selectedId) {
    label = phone ? 'Sélectionné' : 'Meuble sélectionné'
    tone = 'edit'
  } else if (canUndo) {
    label = '↩ pour annuler'
    tone = 'hint'
  }

  // Idle / hint pills clutter the room on a small screen.
  if (phone && (tone === 'idle' || tone === 'hint')) return null

  return (
    <div className="scene-hud" aria-hidden>
      <span className={`scene-hud-pill scene-hud-pill--${tone}`}>{label}</span>
    </div>
  )
}
