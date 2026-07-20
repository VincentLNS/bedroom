import { BedroomScene } from './scene/BedroomScene'
import { CataloguePanel } from './ui/CataloguePanel'
import { SelectionToolbar } from './ui/SelectionToolbar'
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
          <SelectionToolbar />
        </main>
      </div>
    </div>
  )
}
