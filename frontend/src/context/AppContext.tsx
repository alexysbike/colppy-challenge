import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getCurrentMonthRange } from '@/lib/dates'

export interface PeriodState {
  mode: 'month' | 'range'
  month?: string
  from?: string
  to?: string
}

interface AppContextValue {
  period: PeriodState
  setPeriod: (period: PeriodState) => void
}

const defaultPeriod: PeriodState = {
  mode: 'range',
  ...getCurrentMonthRange(),
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<PeriodState>(defaultPeriod)

  const setPeriod = useCallback((next: PeriodState) => {
    setPeriodState(next)
  }, [])

  const value = useMemo(
    () => ({ period, setPeriod }),
    [period, setPeriod],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
