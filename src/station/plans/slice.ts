import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as api from './api'
import type { Plan, GetPlansQuery, Pagination, CreatePlanRequest, UpdatePlanRequest } from './types'

export type PlansState = {
    items: Plan[]
    page: Omit<Pagination, 'items'> | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: PlansState = {
    items: [],
    page: null,
    status: 'idle',
    error: null,
}

export const fetchPlans = createAsyncThunk(
    'plans/fetchAll',
    async (query: GetPlansQuery, { rejectWithValue }) => {
        try {
            const res = await api.getPlans(query)
            if (!res.isSuccess) return rejectWithValue('Fetch plans failed')
            return res.value.data
        } catch {
            return rejectWithValue('Fetch plans failed')
        }
    },
)

export const getPlanByIdThunk = createAsyncThunk(
    'plans/getById',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.getPlanById(id)
            if (!res.isSuccess) return rejectWithValue('Get plan failed')
            return res.value.data
        } catch {
            return rejectWithValue('Get plan failed')
        }
    },
)

export const createPlanThunk = createAsyncThunk(
    'plans/create',
    async (payload: CreatePlanRequest, { rejectWithValue }) => {
        try {
            const res = await api.createPlan(payload)
            if (!res.isSuccess) return rejectWithValue('Create plan failed')
            return res.value.data
        } catch {
            return rejectWithValue('Create plan failed')
        }
    },
)

export const updatePlanThunk = createAsyncThunk(
    'plans/update',
    async (payload: UpdatePlanRequest, { rejectWithValue }) => {
        try {
            const res = await api.updatePlan(payload)
            if (!res.isSuccess) return rejectWithValue('Update plan failed')
            return { id: payload.id, changes: res.value.data }
        } catch {
            return rejectWithValue('Update plan failed')
        }
    },
)

export const deletePlanThunk = createAsyncThunk(
    'plans/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.deletePlan(id)
            if (!res.isSuccess || res.value.data !== true) return rejectWithValue('Delete plan failed')
            return id
        } catch {
            return rejectWithValue('Delete plan failed')
        }
    },
)

const plansSlice = createSlice({
    name: 'plans',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlans.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Pagination>) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                const { ...pageMeta } = action.payload
                state.page = pageMeta
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch plans failed')
            })
            .addCase(createPlanThunk.fulfilled, (state, action: PayloadAction<Plan>) => {
                state.items.unshift(action.payload)
            })
            .addCase(updatePlanThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex((p) => p.hoaHTTID === action.payload.id)
                if (idx !== -1) {
                    state.items[idx] = { ...state.items[idx], ...action.payload.changes }
                }
            })
            .addCase(deletePlanThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.items = state.items.filter((p) => p.hoaHTTID !== action.payload)
            })
    },
})

export default plansSlice.reducer


