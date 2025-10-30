import httpClient from '../api/httpClient'
import type { GetSessionsQuery, GetSessionsResponse } from './types'

export async function getSessions(
  query: GetSessionsQuery,
): Promise<GetSessionsResponse> {
  const { data } = await httpClient.get<GetSessionsResponse>('/sessions', {
    params: query,
  })
  return data
}

