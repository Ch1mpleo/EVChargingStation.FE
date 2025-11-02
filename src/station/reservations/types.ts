export type ApiEnvelope<T> = {
    isSuccess: boolean
    value: {
        code: string
        message: string
        data: T
    }
    error: unknown | null
}

export type ConnectorType = 'CHAdeMO' | 'CCS' | 'AC'

export type Connector = {
    connectorId: string
    connectorType: ConnectorType
    powerKw: number
}

export type StationInfo = {
    stationId: string
    name: string
    connectors: Connector[]
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'

export type Reservation = {
    id: string
    user: string
    status: ReservationStatus
    startTime: string
    endTime: string
    createdAt: string
    station: StationInfo
}

export type ReservationDetail = {
    id: string
    user: string
    status: ReservationStatus
    startTime: string
    endTime: string
    createdAt: string
    station: StationInfo
}

export type CreateReservationResponse = {
    id: string
    user: string
    stationName: string
    connectorType: ConnectorType
    minPowerKw: number
    status: ReservationStatus
    startTime: string
    endTime: string
    createdAt: string
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

export type GetReservationsQuery = {
    pageNumber?: number
    pageSize?: number
    userId?: string
    status?: ReservationStatus
}

export type CreateReservationRequest = {
    stationId: string
    connectorId: string
    startTime: string
    endTime: string
}

export type UpdateReservationRequest = {
    id: string
    stationId: string
    connectorId: string
    startTime: string
    endTime: string
    status: ReservationStatus
}

export type GetReservationsResponse = ApiEnvelope<Paged<Reservation>>
export type ReservationResponse = ApiEnvelope<ReservationDetail>
export type CreateReservationResponseEnvelope = ApiEnvelope<CreateReservationResponse>
export type CancelReservationResponse = ApiEnvelope<boolean>

