import httpClient from '../api/httpClient'
import type {
    CancelReservationResponse,
    CreateReservationRequest,
    CreateReservationResponseEnvelope,
    GetReservationsQuery,
    GetReservationsResponse,
    ReservationResponse,
    UpdateReservationRequest,
} from './types'

export async function getReservations(
    query: GetReservationsQuery,
): Promise<GetReservationsResponse> {
    const { data } = await httpClient.get<GetReservationsResponse>('/reservations', {
        params: query,
    })
    return data
}

export async function getReservationById(
    id: string,
): Promise<ReservationResponse> {
    const { data } = await httpClient.get<ReservationResponse>(`/reservations/${id}`)
    return data
}

export async function createReservation(
    payload: CreateReservationRequest,
): Promise<CreateReservationResponseEnvelope> {
    const { data } = await httpClient.post<CreateReservationResponseEnvelope>(
        '/reservations',
        payload,
    )
    return data
}

export async function updateReservation(
    payload: UpdateReservationRequest,
): Promise<ReservationResponse> {
    const { data } = await httpClient.put<ReservationResponse>(
        `/reservations/${payload.id}`,
        {
            stationId: payload.stationId,
            connectorId: payload.connectorId,
            startTime: payload.startTime,
            endTime: payload.endTime,
            status: payload.status,
        },
    )
    return data
}

export async function cancelReservation(
    id: string,
): Promise<CancelReservationResponse> {
    const { data } = await httpClient.post<CancelReservationResponse>(
        `/reservations/${id}/cancel`,
    )
    return data
}

