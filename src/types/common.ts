export interface PaginationList<T> {
  results: T[]
  totalCount: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommonError = any
