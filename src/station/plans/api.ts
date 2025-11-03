import httpClient from '../api/httpClient'
import type {
    GetPlansQuery,
    GetPlansResponse,
    CreatePlanRequest,
    CreatePlanResponse,
    GetPlanByIdResponse,
    UpdatePlanRequest,
    UpdatePlanResponse,
    DeletePlanResponse,
} from './types'

export async function getPlans(query: GetPlansQuery): Promise<GetPlansResponse> {
    const { data } = await httpClient.get<GetPlansResponse>('/plans', {
        params: query,
    })
    return data
}

export async function createPlan(payload: CreatePlanRequest): Promise<CreatePlanResponse> {
    const { data } = await httpClient.post<CreatePlanResponse>('/plans', payload)
    return data
}

export async function getPlanById(id: string): Promise<GetPlanByIdResponse> {
    const { data } = await httpClient.get<GetPlanByIdResponse>(`/plans/${id}`)
    return data
}

export async function updatePlan(payload: UpdatePlanRequest): Promise<UpdatePlanResponse> {
    const { id, ...body } = payload
    const { data } = await httpClient.put<UpdatePlanResponse>(`/plans/${id}`, body)
    return data
}

export async function deletePlan(id: string): Promise<DeletePlanResponse> {
    const { data } = await httpClient.delete<DeletePlanResponse>(`/plans/${id}`)
    return data
}


