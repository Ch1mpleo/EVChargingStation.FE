export type ApiEnvelope<T> = {
  isSuccess: boolean
  value: {
    code: string
    message: string
    data: T
  }
  error: unknown | null
}

export type SessionStatus = 'Stopped' | 'Active' | 'Paused'

export type Session = {
  id: string
  userId: string
  userEmail: string
  userFullName: string
  connectorId: string
  startTime: string
  endTime: string | null
  status: SessionStatus
  statusDisplay: string
  energyKwh: number
  cost: number
  createdAt: string
  updatedAt: string | null
}

export type Paged<T> = {
  items: T[]
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

export type GetSessionsQuery = {
  search?: string
  sortBy?: string
  isDescending?: boolean
  page?: number
  pageSize?: number
}

export type GetSessionsResponse = ApiEnvelope<Paged<Session>>

// Uninvoiced sessions share the same shape as general sessions
export type GetUninvoicedSessionsQuery = GetSessionsQuery
export type GetUninvoicedSessionsResponse = GetSessionsResponse

