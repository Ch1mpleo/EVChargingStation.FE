export type ConnectorType = 'CCS' | 'CHAdeMO' | 'AC'

export type Vehicle = {
    huyPDID: string
    make: string
    model: string
    year: number
    licensePlate: string
    connectorType: ConnectorType
}

export type PagedVehicles = {
    items: Vehicle[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
}

export type GetVehiclesQuery = {
    page?: number
    pageSize?: number
    model?: string
    brand?: string
    connectorType?: ConnectorType
}

export type CreateVehicleRequest = {
    make: string
    model: string
    year: number
    licensePlate: string
    connectorType: ConnectorType
}

export type UpdateVehicleRequest = {
    guid: string
    make: string
    model: string
    year: number
    licensePlate: string
    connectorType: ConnectorType
}

export type CreateVehicleResponse = { message: string; data: boolean }
export type UpdateVehicleResponse = { message: string }
export type DeleteVehicleResponse = { message: string } | boolean


