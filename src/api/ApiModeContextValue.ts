import { createContext } from 'react'
import type { ApiClient } from './client'
import type { ApiMode } from './config'

export interface ApiModeContextValue {
  mode: ApiMode
  setMode: (mode: ApiMode) => void
  client: ApiClient
}

export const ApiModeContext = createContext<ApiModeContextValue | null>(null)
