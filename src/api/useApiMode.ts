import { useContext } from 'react'
import { ApiModeContext, type ApiModeContextValue } from './ApiModeContextValue'

export function useApiMode(): ApiModeContextValue {
  const context = useContext(ApiModeContext)
  if (!context) throw new Error('useApiMode must be used within an ApiModeProvider.')
  return context
}
