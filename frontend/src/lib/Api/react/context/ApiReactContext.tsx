import { createContext, type ReactNode, useContext, useMemo, useRef } from 'react'

import { Api } from '../../Api'

export interface ApiContextValue {
  api: Api
}

export const ApiContext = createContext<ApiContextValue>({
  // @ts-expect-error
  api: {},
})

export interface ApiContextProviderProps {
  api: Api
  children: ReactNode | ReactNode[]
}

export const ApiContextProvider = ({ api, children }: ApiContextProviderProps) => {
  const apiRef = useRef<Api>(api)
  const value = useMemo<ApiContextValue>(() => ({ api: apiRef.current }), [])
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export const useApiContext = () => useContext<ApiContextValue>(ApiContext)
