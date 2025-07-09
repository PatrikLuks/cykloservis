import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerPushNotifications } from './registerPush';

registerPushNotifications(); // Automatická registrace push při startu (lze upravit na ruční v nastavení)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
