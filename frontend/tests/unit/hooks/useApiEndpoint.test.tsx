import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { ApiContextProvider } from '@/lib/Api/react/context/ApiReactContext'
import { useApiEndpoint } from '@/lib/Api/react/hooks/useApiEndpoint'
import { ColppyApi } from '@/platform/api/ColppyApi'

function wrapper({ children }: { children: ReactNode }) {
  return <ApiContextProvider api={ColppyApi}>{children}</ApiContextProvider>
}

describe('useApiEndpoint', () => {
  it('returns endpoint instance from api context', () => {
    const { result } = renderHook(() => useApiEndpoint('/sales'), { wrapper })

    expect(result.current).toBeDefined()
    expect(result.current.getFullPathWithQuery()).toBe('/sales')
  })
})
