import { BedroomScene } from './scene/BedroomScene'
import { useRoomStore } from './store/roomStore'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-bar">
        <h1>Bedroom</h1>
        {/* DEBUG: temporary until Task 8 catalogue UI — arms place mode for twin bed */}
        <button
          type="button"
          className="debug-arm-place"
          onClick={() => useRoomStore.getState().armPlace('bed-twin')}
        >
          DEBUG: place twin bed
        </button>
      </header>
      <main className="scene-host">
        <BedroomScene />
      </main>
    </div>
  )
}
