import { lazy, Suspense, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import {
  fileToPlacedItems,
  houseFileToRooms,
  loadHouseFromLocalStorage,
  saveHouseToLocalStorage,
  serializeHouseFromState,
} from './persist'
import {
  clearShareParamsFromUrl,
  decodeShareToken,
  readShareTokenFromLocation,
} from './persist/shareLink'
import { emptyHouseRooms } from './house/rooms'
import { useRoomStore, type ShadowQuality } from './store/roomStore'
import type { ChallengeId } from './challenges/challenges'
import { ActionDock } from './ui/ActionDock'
import { CataloguePanel } from './ui/CataloguePanel'
import { CoPlayModal } from './ui/CoPlayModal'
import { DialogHost } from './ui/DialogHost'
import { GalleryModal } from './ui/GalleryModal'
import { ParentDrawer } from './ui/ParentDrawer'
import { SceneHud } from './ui/CoachTip'
import { GestureCoach } from './ui/GestureCoach'
import { LoadingSplash } from './ui/LoadingSplash'
import { PhotoModeOverlay } from './ui/PhotoMode'
import { RoomSwitcher } from './ui/RoomSwitcher'
import { RotateDial } from './ui/RotateDial'
import { ShareQrModal } from './ui/ShareQrModal'
import { SoundBridge } from './ui/SoundBridge'
import { Toast } from './ui/Toast'
import { TopBar } from './ui/TopBar'
import './App.css'

const BedroomScene = lazy(() =>
  import('./scene/BedroomScene').then((m) => ({ default: m.BedroomScene })),
)

const AUTOSAVE_DEBOUNCE_MS = 300
const PREFS_KEY = 'minideco-prefs-v1'
const SPLASH_FALLBACK_MS = 8000

type Prefs = {
  favorites?: string[]
  recents?: string[]
  challengesDone?: ChallengeId[]
  shadowQuality?: ShadowQuality
  bigFingers?: boolean
  highContrast?: boolean
  roomTitle?: string
  soundOn?: boolean
  musicOn?: boolean
  parentLock?: boolean
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Prefs
  } catch {
    return {}
  }
}

function savePrefs() {
  const s = useRoomStore.getState()
  const prefs: Prefs = {
    favorites: s.favorites,
    recents: s.recents,
    challengesDone: s.challengesDone,
    shadowQuality: s.shadowQuality,
    bigFingers: s.bigFingers,
    highContrast: s.highContrast,
    roomTitle: s.roomTitle,
    soundOn: s.soundOn,
    musicOn: s.musicOn,
    parentLock: s.parentLock,
  }
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

export default function App() {
  const photoMode = useRoomStore((s) => s.photoMode)
  const bigFingers = useRoomStore((s) => s.bigFingers)
  const highContrast = useRoomStore((s) => s.highContrast)
  const flashToast = useRoomStore((s) => s.flashToast)
  const [sceneReady, setSceneReady] = useState(false)
  const [shareQrOpen, setShareQrOpen] = useState(false)
  const [coPlayOpen, setCoPlayOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [parentOpen, setParentOpen] = useState(false)

  useEffect(() => {
    const prefs = loadPrefs()
    useRoomStore.setState({
      favorites: prefs.favorites ?? [],
      recents: prefs.recents ?? [],
      challengesDone: prefs.challengesDone ?? [],
      shadowQuality: prefs.shadowQuality ?? 'auto',
      bigFingers: prefs.bigFingers ?? false,
      highContrast: prefs.highContrast ?? false,
      roomTitle: prefs.roomTitle?.trim() || 'Chambre de Louise',
      soundOn: prefs.soundOn ?? true,
      musicOn: prefs.musicOn ?? false,
      parentLock: prefs.parentLock ?? false,
    })

    let cancelled = false
    const boot = async () => {
      const house = emptyHouseRooms()

      const token = readShareTokenFromLocation()
      if (token) {
        const decoded = await decodeShareToken(token)
        if (cancelled) return
        if (decoded.ok) {
          house.bedroom = fileToPlacedItems(decoded.file)
          useRoomStore.getState().replaceHouse(house, 'bedroom')
          clearShareParamsFromUrl()
          flashToast('Chambre ouverte depuis un lien !', 'ok')
          return
        }
        flashToast(decoded.error, 'error')
        clearShareParamsFromUrl()
      }

      const saved = loadHouseFromLocalStorage()
      if (saved) {
        const rooms = houseFileToRooms(saved)
        useRoomStore.getState().replaceHouse(rooms, saved.activeRoom)
        if (saved.title) {
          useRoomStore.getState().setRoomTitle(saved.title)
        }
      } else if (useRoomStore.getState().items.length === 0) {
        useRoomStore.getState().replaceHouse(house, 'bedroom')
      }
    }
    void boot()

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = useRoomStore.subscribe((state, prevState) => {
      if (
        state.items !== prevState.items ||
        state.rooms !== prevState.rooms ||
        state.activeRoom !== prevState.activeRoom ||
        state.roomTitle !== prevState.roomTitle
      ) {
        if (timeoutId !== undefined) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const s = useRoomStore.getState()
          saveHouseToLocalStorage(serializeHouseFromState(s))
        }, AUTOSAVE_DEBOUNCE_MS)
      }

      if (
        state.favorites !== prevState.favorites ||
        state.recents !== prevState.recents ||
        state.challengesDone !== prevState.challengesDone ||
        state.shadowQuality !== prevState.shadowQuality ||
        state.bigFingers !== prevState.bigFingers ||
        state.highContrast !== prevState.highContrast ||
        state.roomTitle !== prevState.roomTitle ||
        state.soundOn !== prevState.soundOn ||
        state.musicOn !== prevState.musicOn ||
        state.parentLock !== prevState.parentLock
      ) {
        savePrefs()
      }
    })

    return () => {
      cancelled = true
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [flashToast])

  useEffect(() => {
    const t = window.setTimeout(() => setSceneReady(true), SPLASH_FALLBACK_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.code !== 'Escape') return

      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      event.preventDefault()
      if (shareQrOpen) {
        setShareQrOpen(false)
        return
      }
      if (coPlayOpen) {
        setCoPlayOpen(false)
        return
      }
      if (galleryOpen) {
        setGalleryOpen(false)
        return
      }
      if (parentOpen) {
        setParentOpen(false)
        return
      }
      const store = useRoomStore.getState()
      if (store.photoMode) {
        store.setPhotoMode(false)
        return
      }
      store.cancelInteraction()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [shareQrOpen, coPlayOpen, galleryOpen, parentOpen])

  const appClass = [
    'app',
    bigFingers ? 'app--big-fingers' : '',
    highContrast ? 'app--high-contrast' : '',
    photoMode ? 'app--photo' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={appClass}>
      <LoadingSplash ready={sceneReady} />
      <TopBar
        onOpenShareQr={() => setShareQrOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        onOpenParent={() => setParentOpen(true)}
      />
      <div className="workspace">
        {!photoMode && <CataloguePanel />}
        <main className="scene-host">
          <SceneHud />
          <Suspense fallback={null}>
            <BedroomScene onReady={() => setSceneReady(true)} />
          </Suspense>
          <RoomSwitcher />
          <ActionDock />
          <RotateDial />
          <Toast />
          <PhotoModeOverlay />
        </main>
      </div>
      {!photoMode && <GestureCoach />}
      <SoundBridge />
      <DialogHost />
      <ShareQrModal open={shareQrOpen} onClose={() => setShareQrOpen(false)} />
      <CoPlayModal open={coPlayOpen} onClose={() => setCoPlayOpen(false)} />
      <GalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} />
      <ParentDrawer
        open={parentOpen}
        onClose={() => setParentOpen(false)}
        onOpenCoPlay={() => setCoPlayOpen(true)}
      />
      <Analytics />
    </div>
  )
}
