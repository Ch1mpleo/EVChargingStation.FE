import httpClient from '../api/httpClient'
import type { GetStationsWithConnectorsResponse } from './types'

export async function getStationsWithConnectors(): Promise<GetStationsWithConnectorsResponse> {
    const { data } = await httpClient.get<GetStationsWithConnectorsResponse>(
        '/stations/connectors',
    )
    return data
}

