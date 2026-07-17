import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoreInit } from 'flowbite-react/store/init'
import { CONFIG } from '../.flowbite-react/init'
import { AppProvider } from '@/context'
import { ApiContextProvider } from '@/lib/Api'
import { ColppyApi } from '@/platform/api'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreInit {...CONFIG} mode="light" version={4} />
    <ApiContextProvider api={ColppyApi}>
      <AppProvider>
        <App />
      </AppProvider>
    </ApiContextProvider>
  </StrictMode>,
)
