export type ApiEnvelope<T> = {
    isSuccess: boolean
    value: {
        code: string
        message: string
        data: T
    }
    error: unknown | null
}

export type StationStatus = 'Offline' | 'Online'

export type Station = {
    id: string
    name: string
    locationId: string
    status: StationStatus
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

export type GetStationsQuery = {
    pageNumber?: number
    pageSize?: number
    status?: StationStatus
    locationId?: string
    search?: string
}

export type CreateStationRequest = {
    name: string
    locationId: string
    status: StationStatus
}

export type UpdateStationRequest = {
    id: string
    name: string
    locationId: string
    status: StationStatus
}

export type GetStationsResponse = ApiEnvelope<Paged<Station>>
export type StationResponse = ApiEnvelope<Station>
export type DeleteStationResponse = ApiEnvelope<string>


