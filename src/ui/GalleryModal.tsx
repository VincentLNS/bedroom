import { useMemo, useState } from 'react'
import { serializeLayout } from '../persist'
import { buildShareUrl, copyText } from '../persist/shareLink'
import { createBathroomLayout } from '../presets/bathroom'
import { createCuisineLayout } from '../presets/cuisine'
import { createHallLayout } from '../presets/hall'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'
import { askConfirm, askPrompt } from './dialogStore'
import { useRoomStore } from '../store/roomStore'
import type { HouseRoomId } from '../house/rooms'

export type GalleryEntry = {
  id: string
  title: string
  author: string
  blurb: string
  room: HouseRoomId
  build: () => ReturnType<typeof createLouiseLayout>
}

const FEATURED: GalleryEntry[] = [
  {
    id: 'louise',
    title: 'Chambre de Louise',
    author: 'Mini Déco',
    blurb: 'Le modèle rose, lit & maison de poupée.',
    room: 'bedroom',
    build: createLouiseLayout,
  },
  {
    id: 'salon',
    title: 'Salon cosy',
    author: 'Mini Déco',
    blurb: 'Canapé blush, lecture et lumière douce.',
    room: 'salon',
    build: createSalonLayout,
  },
  {
    id: 'hall',
    title: 'Couloir d’entrée',
    author: 'Mini Déco',
    blurb: 'Porte-manteau, banc et tapis nuage.',
    room: 'hall',
    build: createHallLayout,
  },
  {
    id: 'cuisine',
    title: 'Cuisine rose',
    author: 'Mini Déco',
    blurb: 'Dinette, plaque, évier et bar goûter.',
    room: 'cuisine',
    build: createCuisineLayout,
  },
  {
    id: 'bathroom',
    title: 'Salle de bain',
    author: 'Mini Déco',
    blurb: 'Baignoire, douche et tour de lessive.',
    room: 'bathroom',
    build: createBathroomLayout,
  },
]

const PUBLISH_KEY = 'minideco-gallery-published-v1'

type Published = {
  id: string
  title: string
  savedAt: number
  shareUrl: string
}

function loadPublished(): Published[] {
  try {
    const raw = localStorage.getItem(PUBLISH_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Published[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function savePublished(list: Published[]) {
  localStorage.setItem(PUBLISH_KEY, JSON.stringify(list.slice(0, 20)))
}

type Props = {
  open: boolean
  onClose: () => void
}

export function GalleryModal({ open, onClose }: Props) {
  const replaceLayout = useRoomStore((s) => s.replaceLayout)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const items = useRoomStore((s) => s.items)
  const flashToast = useRoomStore((s) => s.flashToast)
  const markChallengeDone = useRoomStore((s) => s.markChallengeDone)
  const [published, setPublished] = useState(loadPublished)

  const featured = useMemo(() => FEATURED, [])

  if (!open) return null

  const openEntry = async (entry: GalleryEntry) => {
    const ok = await askConfirm({
      title: `Ouvrir « ${entry.title} » ?`,
      message: `Dans la pièce ${entry.room}. Les meubles de cette pièce seront remplacés.`,
      confirmLabel: 'Ouvrir',
    })
    if (!ok) return
    setActiveRoom(entry.room)
    replaceLayout(entry.build())
    flashToast(`Modèle : ${entry.title}`, 'ok')
    onClose()
  }

  const publishMine = async () => {
    const title =
      (await askPrompt({
        title: 'Titre du souvenir',
        message: 'Reste sur cet appareil (pas une galerie mondiale).',
        defaultValue: 'Ma super chambre',
        confirmLabel: 'Enregistrer',
      })) || 'Ma chambre'
    try {
      const url = await buildShareUrl(serializeLayout(items))
      const entry: Published = {
        id: crypto.randomUUID(),
        title,
        savedAt: Date.now(),
        shareUrl: url,
      }
      const next = [entry, ...loadPublished()]
      savePublished(next)
      setPublished(next)
      await copyText(url)
      markChallengeDone('share-room')
      flashToast('Souvenir enregistré · lien copié', 'ok')
    } catch {
      flashToast('Publication impossible (lien trop long)', 'error')
    }
  }

  return (
    <div className="magic-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="magic-modal magic-modal--wide"
        role="dialog"
        aria-label="Modèles"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Modèles & souvenirs</h2>
        <p className="magic-modal-hint">
          Inspiration Mini Déco, et tes souvenirs enregistrés sur cet appareil.
        </p>

        <h3 className="gallery-section-title">Modèles</h3>
        <ul className="gallery-list">
          {featured.map((entry) => (
            <li key={entry.id} className="gallery-card">
              <div>
                <p className="gallery-card-title">{entry.title}</p>
                <p className="gallery-card-meta">
                  {entry.author} · {entry.blurb}
                </p>
              </div>
              <button
                type="button"
                className="top-bar-btn top-bar-btn--primary"
                onClick={() => void openEntry(entry)}
              >
                Ouvrir
              </button>
            </li>
          ))}
        </ul>

        <h3 className="gallery-section-title">Sur cet appareil</h3>
        {published.length === 0 ? (
          <p className="magic-modal-hint">Pas encore de souvenir enregistré ici.</p>
        ) : (
          <ul className="gallery-list">
            {published.map((p) => (
              <li key={p.id} className="gallery-card">
                <div>
                  <p className="gallery-card-title">{p.title}</p>
                  <p className="gallery-card-meta">
                    {new Date(p.savedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button
                  type="button"
                  className="top-bar-btn"
                  onClick={async () => {
                    await copyText(p.shareUrl)
                    flashToast('Lien copié', 'ok')
                  }}
                >
                  Lien
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="magic-modal-actions">
          <button type="button" className="top-bar-btn" onClick={onClose}>
            Fermer
          </button>
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            onClick={() => void publishMine()}
          >
            Garder ma pièce
          </button>
        </div>
      </div>
    </div>
  )
}