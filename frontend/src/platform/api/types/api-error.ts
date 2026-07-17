export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'METHOD_NOT_ALLOWED'
  | (string & {})

export interface ApiErrorBody {
  error: string
  code: ApiErrorCode
}
