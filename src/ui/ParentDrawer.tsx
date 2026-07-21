import { useRef } from 'react'
import {
  downloadBedroomFile,
  houseFileToRooms,
  readHouseFile,
  serializeHouseFromState,
} from '../persist'
import {
  deleteCloudSave,
  listCloudSaves,
  loadCloudSave,
  saveToCloud,
} from '../persist/cloudSaves'
import { createBathroomLayout } from '../presets/bathroom'
import { createCuisineLayout } from '../presets/cuisine'
import { createHallLayout } from '../presets/hall'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'
import {
  nextShadowQuality,
  shadowQualityLabel,
} from '../perf/quality'
import { useRoomStore } from '../store/roomStore'
import { askAlert, askConfirm, askPick, askPrompt } from './dialogStore'
import {
  changeParentPin,
  disableParentLockWithPin,
  enableParentLockWithPin,
  resetParentPin,
} from './parentGate'
import { exportSouvenirPdf } from './souvenirPdf'

type Props = {
  open: boolean
  onClose: () => void
  onOpenCoPlay: () => void
}

/** Parent-only tools drawer (PIN-gated from the top bar). */
export function ParentDrawer({ open, onClose, onOpenCoPlay }: Props) {
  const clearRoom = useRoomStore((s) => s.clearRoom)
  const clearPending = useRoomStore((s) => s.clearPending)
  const select = useRoomStore((s) => s.select)
  const replaceLayout = useRoomStore((s) => s.replaceLayout)
  const replaceHouse = useRoomStore((s) => s.replaceHouse)
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const clearImportWarnings = useRoomStore((s) => s.clearImportWarnings)
  const setRoomTitle = useRoomStore((s) => s.setRoomTitle)
  const flashToast = useRoomStore((s) => s.flashToast)
  const parentLock = useRoomStore((s) => s.parentLock)
  const shadowQuality = useRoomStore((s) => s.shadowQuality)
  const setShadowQuality = useRoomStore((s) => s.setShadowQuality)
  const bigFingers = useRoomStore((s) => s.bigFingers)
  const setBigFingers = useRoomStore((s) => s.setBigFingers)
  const highContrast = useRoomStore((s) => s.highContrast)
  const setHighContrast = useRoomStore((s) => s.setHighContrast)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const applyHouseFile = (file: Parameters<typeof houseFileToRooms>[0]) => {
    clearImportWarnings()
    replaceHouse(houseFileToRooms(file), file.activeRoom)
    if (file.title) setRoomTitle(file.title)
    clearPending()
    select(null)
  }

  const applyPreset = async (
    title: string,
    message: string,
    room: 'bedroom' | 'salon' | 'hall' | 'cuisine' | 'bathroom',
    build: () => ReturnType<typeof createLouiseLayout>,
  ) => {
    if (parentLock) {
      flashToast('Verrou parent : modèles verrouillés', 'error')
      return
    }
    const ok = await askConfirm({
      title,
      message,
      confirmLabel: 'Charger',
    })
    if (!ok) return
    clearImportWarnings()
    setActiveRoom(room)
    replaceLayout(build())
    clearPending()
    select(null)
  }

  const handleEmpty = async () => {
    if (parentLock) {
      flashToast('Verrou parent : impossible de vider', 'error')
      return
    }
    const ok = await askConfirm({
      title: 'Vider la pièce ?',
      message: 'Tous les meubles de la pièce active disparaîtront.',
      confirmLabel: 'Vider',
      danger: true,
    })
    if (!ok) return
    clearRoom()
    clearPending()
    select(null)
    flashToast('Pièce vide', 'info')
  }

  const handleDeviceSave = async () => {
    const name = await askPrompt({
      title: 'Sauver sur cet appareil',
      message: 'Nom de la sauvegarde (reste sur cette tablette).',
      defaultValue: 'Ma maison',
      confirmLabel: 'Sauver',
    })
    if (!name) return
    saveToCloud(name, serializeHouseFromState(useRoomStore.getState()))
    flashToast('Sauvegardé sur cet appareil', 'ok')
  }

  const handleDeviceLoad = async () => {
    if (parentLock) {
      flashToast('Verrou parent : ouverture verrouillée', 'error')
      return
    }
    const saves = listCloudSaves()
    if (saves.length === 0) {
      flashToast('Aucune sauvegarde sur cet appareil', 'info')
      return
    }
    const id = await askPick({
      title: 'Ouvrir une sauvegarde',
      message: 'Sur cet appareil uniquement.',
      options: saves.map((s) => ({
        id: s.id,
        label: s.name,
        meta: new Date(s.savedAt).toLocaleDateString('fr-FR'),
      })),
    })
    if (!id) return
    const save = saves.find((s) => s.id === id)
    if (!save) return
    const ok = await askConfirm({
      title: `Ouvrir « ${save.name} » ?`,
      message: 'Toute la maison actuelle sera remplacée.',
      confirmLabel: 'Ouvrir',
      danger: true,
    })
    if (!ok) return
    const loaded = loadCloudSave(save.id)
    if (!loaded) return
    applyHouseFile(loaded.file)
    flashToast('Maison ouverte', 'ok')
  }

  const handleDeviceDelete = async () => {
    const saves = listCloudSaves()
    if (saves.length === 0) {
      flashToast('Aucune sauvegarde sur cet appareil', 'info')
      return
    }
    const id = await askPick({
      title: 'Effacer une sauvegarde',
      options: saves.map((s) => ({ id: s.id, label: s.name })),
    })
    if (!id) return
    const save = saves.find((s) => s.id === id)
    if (!save) return
    const ok = await askConfirm({
      title: `Effacer « ${save.name} » ?`,
      message: 'Impossible à récupérer ensuite.',
      confirmLabel: 'Effacer',
      danger: true,
    })
    if (!ok) return
    deleteCloudSave(save.id)
    flashToast('Sauvegarde effacée', 'info')
  }

  const handleExport = () => {
    downloadBedroomFile(serializeHouseFromState(useRoomStore.getState()))
    flashToast('Fichier maison exporté', 'ok')
  }

  const handleImportClick = () => {
    if (parentLock) {
      flashToast('Verrou parent : ouverture verrouillée', 'error')
      return
    }
    fileInputRef.current?.click()
  }

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = await readHouseFile(file)
    if (!result.ok) {
      await askAlert({ title: 'Fichier invalide', message: result.error })
      return
    }
    const ok = await askConfirm({
      title: 'Ouvrir ce plan ?',
      message: 'Toute la maison actuelle sera remplacée.',
      confirmLabel: 'Ouvrir',
      danger: true,
    })
    if (!ok) return
    applyHouseFile(result.file)
    flashToast('Maison ouverte', 'ok')
  }

  const handleSouvenir = async () => {
    const result = await exportSouvenirPdf()
    if (result === 'ok') flashToast('Souvenir prêt à imprimer / PDF', 'ok')
    else if (result === 'blocked') {
      flashToast('Autorise les pop-ups pour le souvenir', 'error')
    } else flashToast('Capture impossible — ouvre la scène d’abord', 'error')
  }

  const handleToggleLock = async () => {
    if (parentLock) await disableParentLockWithPin()
    else await enableParentLockWithPin()
  }

  return (
    <div className="magic-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="magic-modal magic-modal--wide parent-drawer"
        role="dialog"
        aria-label="Espace parent"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Espace parent</h2>
        <p className="magic-modal-hint">
          Réglages, modèles et sauvegardes — protégés par un code.
        </p>

        <h3 className="gallery-section-title">Verrou</h3>
        <div className="parent-drawer-row">
          <button
            type="button"
            className={
              parentLock ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
            }
            onClick={() => void handleToggleLock()}
          >
            {parentLock ? 'Verrou activé' : 'Activer le verrou'}
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void changeParentPin()}
          >
            Changer le code
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void resetParentPin()}
          >
            Effacer le code
          </button>
          <span className="parent-drawer-note">
            Bloque catalogue, modèles, déplacer et supprimer.
          </span>
        </div>

        <h3 className="gallery-section-title">Modèles</h3>
        <div className="parent-drawer-actions">
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            onClick={() =>
              void applyPreset(
                'Modèle Louise ?',
                'Remplace la chambre par le modèle Louise.',
                'bedroom',
                createLouiseLayout,
              )
            }
          >
            Chambre Louise
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() =>
              void applyPreset(
                'Salon cosy ?',
                'Remplace le salon par le modèle cosy.',
                'salon',
                createSalonLayout,
              )
            }
          >
            Salon cosy
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() =>
              void applyPreset(
                'Couloir d’entrée ?',
                'Remplace le couloir par le modèle d’entrée.',
                'hall',
                createHallLayout,
              )
            }
          >
            Couloir
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() =>
              void applyPreset(
                'Cuisine rose ?',
                'Remplace la cuisine par le modèle dinette.',
                'cuisine',
                createCuisineLayout,
              )
            }
          >
            Cuisine
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() =>
              void applyPreset(
                'Salle de bain ?',
                'Remplace la salle de bain par le modèle pastel.',
                'bathroom',
                createBathroomLayout,
              )
            }
          >
            Salle de bain
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void handleEmpty()}
          >
            Vider la pièce
          </button>
        </div>

        <h3 className="gallery-section-title">Sur cet appareil</h3>
        <p className="magic-modal-hint">
          Pas un vrai cloud : les saves restent sur cette tablette.
        </p>
        <div className="parent-drawer-actions">
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void handleDeviceSave()}
          >
            Sauver ici
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void handleDeviceLoad()}
          >
            Ouvrir ici
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void handleDeviceDelete()}
          >
            Effacer save
          </button>
          <button type="button" className="top-bar-btn" onClick={handleExport}>
            Exporter fichier
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={handleImportClick}
          >
            Importer fichier
          </button>
        </div>

        <h3 className="gallery-section-title">Confort & expérimental</h3>
        <div className="parent-drawer-actions">
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => setShadowQuality(nextShadowQuality(shadowQuality))}
          >
            {shadowQualityLabel(shadowQuality)}
          </button>
          <button
            type="button"
            className={
              bigFingers ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
            }
            onClick={() => setBigFingers(!bigFingers)}
          >
            Gros doigts
          </button>
          <button
            type="button"
            className={
              highContrast ? 'top-bar-btn top-bar-btn--primary' : 'top-bar-btn'
            }
            onClick={() => setHighContrast(!highContrast)}
          >
            Contraste
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => void handleSouvenir()}
          >
            Souvenir PDF
          </button>
          <button
            type="button"
            className="top-bar-btn"
            onClick={() => {
              onOpenCoPlay()
              onClose()
            }}
            title="Beta — décorer à deux via PeerJS"
          >
            Co-déco (beta)
          </button>
        </div>

        <div className="magic-modal-actions">
          <button
            type="button"
            className="top-bar-btn top-bar-btn--primary"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.bedroom.json,.minideco.json,application/json"
          hidden
          onChange={(e) => void handleImportFile(e)}
        />
      </div>
    </div>
  )
}
