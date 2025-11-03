import httpClient from '../api/httpClient'
import type {
  GetSessionsQuery,
  GetSessionsResponse,
  GetUninvoicedSessionsQuery,
  GetUninvoicedSessionsResponse,
} from './types'

export async function getSessions(
  query: GetSessionsQuery,
): Promise<GetSessionsResponse> {
  const { data } = await httpClient.get<GetSessionsResponse>('/sessions', {
    params: query,
  })
  return data
}

export async function getUninvoicedSessions(
  query: GetUninvoicedSessionsQuery,
): Promise<GetUninvoicedSessionsResponse> {
  const { data } = await httpClient.get<GetUninvoicedSessionsResponse>(
    '/sessions/uninvoice',
    {
      params: query,
    },
  )
  return data
}

