import httpClient from '../api/httpClient'
import type {
    CreateStationRequest,
    DeleteStationResponse,
    GetStationsQuery,
    GetStationsResponse,
    StationResponse,
    UpdateStationRequest,
} from './types'

export async function getStations(
    query: GetStationsQuery,
): Promise<GetStationsResponse> {
    const { data } = await httpClient.get<GetStationsResponse>('/stations', {
        params: query,
    })
    return data
}

export async function createStation(
    payload: CreateStationRequest,
): Promise<StationResponse> {
    const { data } = await httpClient.post<StationResponse>('/stations', payload)
    return data
}

export async function updateStation(
    payload: UpdateStationRequest,
): Promise<StationResponse> {
    const { data } = await httpClient.put<StationResponse>(
        `/stations/${payload.id}`,
        { name: payload.name, locationId: payload.locationId, status: payload.status },
    )
    return data
}

export async function deleteStation(id: string): Promise<DeleteStationResponse> {
    const { data } = await httpClient.delete<DeleteStationResponse>(
        `/stations/${id}`,
    )
    return data
}


