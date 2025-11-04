import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type {
    CreateVehicleRequest,
    GetVehiclesQuery,
    PagedVehicles,
    UpdateVehicleRequest,
    Vehicle,
} from './types'

export type VehiclesState = {
    items: Vehicle[]
    page: Omit<PagedVehicles, 'items'> | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: VehiclesState = {
    items: [],
    page: null,
    status: 'idle',
    error: null,
}

export const fetchVehicles = createAsyncThunk(
    'vehicles/fetch',
    async (query: GetVehiclesQuery, { rejectWithValue }) => {
        try {
            const res = await api.getVehicles(query)
            return res
        } catch {
            return rejectWithValue('Fetch vehicles failed')
        }
    },
)

export const createVehicleThunk = createAsyncThunk(
    'vehicles/create',
    async (payload: CreateVehicleRequest, { rejectWithValue }) => {
        try {
            const res = await api.createVehicle(payload)
            if (res && (res as any).data === true) return res
            return rejectWithValue('Create vehicle failed')
        } catch {
            return rejectWithValue('Create vehicle failed')
        }
    },
)

export const updateVehicleThunk = createAsyncThunk(
    'vehicles/update',
    async (payload: UpdateVehicleRequest, { rejectWithValue }) => {
        try {
            const res = await api.updateVehicle(payload)
            return res
        } catch {
            return rejectWithValue('Update vehicle failed')
        }
    },
)

export const deleteVehicleThunk = createAsyncThunk(
    'vehicles/delete',
    async (guid: string, { rejectWithValue }) => {
        try {
            await api.deleteVehicle(guid)
            return guid
        } catch {
            return rejectWithValue('Delete vehicle failed')
        }
    },
)

const vehiclesSlice = createSlice({
    name: 'vehicles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVehicles.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchVehicles.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                const { ...rest } = action.payload
                state.page = rest
            })
            .addCase(fetchVehicles.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch vehicles failed')
            })
            .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
                state.items = state.items.filter((v) => v.huyPDID !== action.payload)
            })
    },
})

export default vehiclesSlice.reducer


