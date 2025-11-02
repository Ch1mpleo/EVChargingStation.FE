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

export type StationWithConnectors = {
    stationId: string
    name: string
    connectors: Connector[]
}

export type GetStationsWithConnectorsResponse = ApiEnvelope<StationWithConnectors[]>

