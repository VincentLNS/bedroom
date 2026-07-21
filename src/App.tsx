import { lazy, Suspense, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import {
  fileToPlacedItems,
  loadFromLocalStorage,
  saveToLocalStorage,
  serializeLayout,
} from './persist'
import {
  clearShareParamsFromUrl,
  decodeShareToken,
  readShareTokenFromLocation,
} from './persist/shareLink'
import { createLouiseLayout } from './presets/louise'
import { useRoomStore, type ShadowQuality } from './store/roomStore'
import type { ChallengeId } from './challenges/challenges'
import { ActionDock } from './ui/ActionDock'
import { CataloguePanel } from './ui/CataloguePanel'
import { SceneHud } from './ui/CoachTip'
import { GestureCoach } from './ui/GestureCoach'
import { LoadingSplash } from './ui/LoadingSplash'
import { PhotoModeOverlay } from './ui/PhotoMode'
import { RotateDial } from './ui/RotateDial'
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

  useEffect(() => {
    const prefs = loadPrefs()
    useRoomStore.setState({
      favorites: prefs.favorites ?? [],
      recents: prefs.recents ?? [],
      challengesDone: prefs.challengesDone ?? [],
      shadowQuality: prefs.shadowQuality ?? 'high',
      bigFingers: prefs.bigFingers ?? false,
      highContrast: prefs.highContrast ?? false,
    })

    let cancelled = false
    const boot = async () => {
      const token = readShareTokenFromLocation()
      if (token) {
        const decoded = await decodeShareToken(token)
        if (cancelled) return
        if (decoded.ok) {
          useRoomStore.getState().replaceLayout(fileToPlacedItems(decoded.file))
          clearShareParamsFromUrl()
          flashToast('Chambre ouverte depuis un lien !', 'ok')
          return
        }
        flashToast(decoded.error, 'error')
        clearShareParamsFromUrl()
      }

      const saved = loadFromLocalStorage()
      if (saved) {
        useRoomStore.getState().replaceLayout(fileToPlacedItems(saved))
      } else if (useRoomStore.getState().items.length === 0) {
        useRoomStore.getState().replaceLayout(createLouiseLayout())
      }
    }
    void boot()

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = useRoomStore.subscribe((state, prevState) => {
      if (state.items !== prevState.items) {
        if (timeoutId !== undefined) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          saveToLocalStorage(serializeLayout(useRoomStore.getState().items))
        }, AUTOSAVE_DEBOUNCE_MS)
      }

      if (
        state.favorites !== prevState.favorites ||
        state.recents !== prevState.recents ||
        state.challengesDone !== prevState.challengesDone ||
        state.shadowQuality !== prevState.shadowQuality ||
        state.bigFingers !== prevState.bigFingers ||
        state.highContrast !== prevState.highContrast
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
      const store = useRoomStore.getState()
      if (store.photoMode) {
        store.setPhotoMode(false)
        return
      }
      store.cancelInteraction()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

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
      <TopBar />
      <div className="workspace">
        {!photoMode && <CataloguePanel />}
        <main className="scene-host">
          <SceneHud />
          <Suspense fallback={null}>
            <BedroomScene onReady={() => setSceneReady(true)} />
          </Suspense>
          <ActionDock />
          <RotateDial />
          <Toast />
          <PhotoModeOverlay />
        </main>
      </div>
      {!photoMode && <GestureCoach />}
      <Analytics />
    </div>
  )
}
