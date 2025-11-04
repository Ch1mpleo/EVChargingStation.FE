import httpClient from '../api/httpClient'
import type {
    CreateVehicleRequest,
    CreateVehicleResponse,
    DeleteVehicleResponse,
    GetVehiclesQuery,
    PagedVehicles,
    UpdateVehicleRequest,
    UpdateVehicleResponse,
    Vehicle,
} from './types'

export async function getVehicles(query: GetVehiclesQuery): Promise<PagedVehicles> {
    const { data } = await httpClient.get<PagedVehicles>('/vehicle', { params: query })
    return data
}

export async function createVehicle(payload: CreateVehicleRequest): Promise<CreateVehicleResponse> {
    const { data } = await httpClient.post<CreateVehicleResponse>('/vehicle', payload)
    return data
}

export async function getVehicleById(guid: string): Promise<Vehicle> {
    const { data } = await httpClient.get<Vehicle>(`/vehicle/${guid}`)
    return data
}

export async function updateVehicle(payload: UpdateVehicleRequest): Promise<UpdateVehicleResponse> {
    const { data } = await httpClient.put<UpdateVehicleResponse>(`/vehicle/${payload.guid}`, {
        make: payload.make,
        model: payload.model,
        year: payload.year,
        licensePlate: payload.licensePlate,
        connectorType: payload.connectorType,
    })
    return data
}

export async function deleteVehicle(guid: string): Promise<DeleteVehicleResponse> {
    const { data } = await httpClient.delete<DeleteVehicleResponse>(`/vehicle/${guid}`)
    return data
}


