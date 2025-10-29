import httpClient from '../api/httpClient'
import type { GetLocationsQuery, GetLocationsResponse } from './types'

export async function getLocations(
    query: GetLocationsQuery,
): Promise<GetLocationsResponse> {
    const { data } = await httpClient.get<GetLocationsResponse>('/locations', {
        params: query,
    })
    return data
}


