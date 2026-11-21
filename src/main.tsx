import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApiModeProvider } from './api/ApiModeContext.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApiModeProvider>
  </StrictMode>,
)
