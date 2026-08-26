import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SlugtreeProvider } from 'slugtree/react'

createRoot(document.getElementById('root')!).render(
  <SlugtreeProvider>
    <App />
  </SlugtreeProvider>
)
