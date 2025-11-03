import type { ApiEnvelope } from '../auth/types'

export type Plan = {
    hoaHTTID: string
    name: string
    description: string
    type: 'Prepaid' | 'Postpaid' | 'VIP' | string
    price: number
    maxDailyKwh: number | null
}

export type Pagination = {
    items: Plan[]
    currentPage: number
    totalPages: number
    pageSize: number
    totalCount: number
    hasPrevious: boolean
    hasNext: boolean
}

export type GetPlansQuery = {
    search?: string
    sortBy?: string
    isDescending?: boolean
    page?: number
    pageSize?: number
}

export type CreatePlanRequest = {
    name: string
    description: string
    type: Plan['type']
    price: number
    maxDailyKwh: number | null
}

export type UpdatePlanRequest = {
    id: string
    name: string
    description: string
    type: Plan['type']
    price: number
    maxDailyKwh: number | null
}

export type GetPlansResponse = ApiEnvelope<Pagination>
export type CreatePlanResponse = ApiEnvelope<Plan>
export type GetPlanByIdResponse = ApiEnvelope<Plan>
export type UpdatePlanResponse = ApiEnvelope<Omit<Plan, 'hoaHTTID'>>
export type DeletePlanResponse = ApiEnvelope<boolean>


