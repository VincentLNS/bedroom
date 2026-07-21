import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/nunito/latin-500.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/nunito/latin-ext-500.css'
import '@fontsource/nunito/latin-ext-600.css'
import '@fontsource/nunito/latin-ext-700.css'
import '@fontsource/nunito/latin-ext-800.css'
import '@fontsource/baloo-2/latin-500.css'
import '@fontsource/baloo-2/latin-600.css'
import '@fontsource/baloo-2/latin-700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-500.css'
import '@fontsource/baloo-2/latin-ext-600.css'
import '@fontsource/baloo-2/latin-ext-700.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
