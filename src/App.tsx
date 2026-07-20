import { BedroomScene } from './scene/BedroomScene'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-bar">
        <h1>Bedroom</h1>
      </header>
      <main className="scene-host">
        <BedroomScene />
      </main>
    </div>
  )
}
