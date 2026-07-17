import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppProvider, useAppContext } from '@/context'

describe('AppContext', () => {
  it('provides default period for current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 16))

    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    })

    expect(result.current.period).toMatchObject({
      mode: 'range',
      from: '2026-07-01',
      to: '2026-07-31',
    })

    vi.useRealTimers()
  })

  it('updates period via setPeriod', () => {
    const { result } = renderHook(() => useAppContext(), {
      wrapper: AppProvider,
    })

    act(() => {
      result.current.setPeriod({
        mode: 'range',
        from: '2026-06-01',
        to: '2026-06-30',
      })
    })

    expect(result.current.period).toEqual({
      mode: 'range',
      from: '2026-06-01',
      to: '2026-06-30',
    })
  })

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAppContext())).toThrow(
      'useAppContext must be used within AppProvider',
    )
  })
})
