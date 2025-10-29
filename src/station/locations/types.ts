export type ApiEnvelope<T> = {
    isSuccess: boolean
    value: {
        code: string
        message: string
        data: T
    }
    error: unknown | null
}

export type Location = {
    id: string
    name: string
    address: string
    latitude: number
    longitude: number
    city: string
    stateProvince: string
    country: string
    timezone: string
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

export type GetLocationsQuery = {
    pageNumber?: number
    pageSize?: number
    city?: string
}

export type GetLocationsResponse = ApiEnvelope<Paged<Location>>


