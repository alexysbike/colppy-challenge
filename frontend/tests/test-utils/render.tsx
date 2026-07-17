import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { AppProvider } from '@/context'
import { ApiContextProvider } from '@/lib/Api'
import { ColppyApi } from '@/platform/api'

interface ProvidersProps {
  children: ReactNode
}

function Providers({ children }: ProvidersProps) {
  return (
    <ApiContextProvider api={ColppyApi}>
      <AppProvider>{children}</AppProvider>
    </ApiContextProvider>
  )
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Providers, ...options })
}
