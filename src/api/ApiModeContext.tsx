import { useMemo, useState, type ReactNode } from 'react'
import { apiEnvironments, type ApiMode } from './config'
import { createApiClient } from './client'
import { ApiModeContext } from './ApiModeContextValue'

export function ApiModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ApiMode>('portfolio')
  const client = useMemo(() => createApiClient(mode, apiEnvironments[mode]), [mode])
  const value = useMemo(() => ({ mode, setMode, client }), [mode, client])

  return <ApiModeContext.Provider value={value}>{children}</ApiModeContext.Provider>
}
