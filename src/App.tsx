import { BedroomScene } from './scene/BedroomScene'
import { CataloguePanel } from './ui/CataloguePanel'
import { TopBar } from './ui/TopBar'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <CataloguePanel />
        <main className="scene-host">
          <BedroomScene />
        </main>
      </div>
    </div>
  )
}
