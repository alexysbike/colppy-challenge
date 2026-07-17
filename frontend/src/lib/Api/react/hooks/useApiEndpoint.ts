import { useRef } from 'react'

import { RESTEndpoint } from '../../RESTEndpoint'
import { useApiContext } from '../context'

export const useApiEndpoint = <S = any, T extends RESTEndpoint = RESTEndpoint<S>>(path: string): RESTEndpoint<S> => {
  const { api } = useApiContext();
  const endpoint = useRef<T>(api?.getEndpoint(path) as T);

  return endpoint.current;
}
