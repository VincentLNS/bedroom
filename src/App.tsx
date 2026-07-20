import { useEffect } from 'react'
import { BedroomScene } from './scene/BedroomScene'
import {
  fileToPlacedItems,
  loadFromLocalStorage,
  saveToLocalStorage,
  serializeLayout,
} from './persist'
import { useRoomStore } from './store/roomStore'
import { CataloguePanel } from './ui/CataloguePanel'
import { SelectionToolbar } from './ui/SelectionToolbar'
import { TopBar } from './ui/TopBar'
import './App.css'

const AUTOSAVE_DEBOUNCE_MS = 300

export default function App() {
  useEffect(() => {
    const saved = loadFromLocalStorage()
    if (saved) {
      useRoomStore.getState().replaceLayout(fileToPlacedItems(saved))
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const unsubscribe = useRoomStore.subscribe((state, prevState) => {
      if (state.items === prevState.items) return

      if (timeoutId !== undefined) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        saveToLocalStorage(serializeLayout(useRoomStore.getState().items))
      }, AUTOSAVE_DEBOUNCE_MS)
    })

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <CataloguePanel />
        <main className="scene-host">
          <BedroomScene />
          <SelectionToolbar />
        </main>
      </div>
    </div>
  )
}
