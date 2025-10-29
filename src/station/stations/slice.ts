import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type {
    CreateStationRequest,
    GetStationsQuery,
    Paged,
    Station,
    UpdateStationRequest,
} from './types'

export type StationsState = {
    items: Station[]
    page: Omit<Paged<Station>, 'items'> | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: StationsState = {
    items: [],
    page: null,
    status: 'idle',
    error: null,
}

export const fetchStations = createAsyncThunk(
    'stations/fetch',
    async (query: GetStationsQuery, { rejectWithValue }) => {
        try {
            const res = await api.getStations(query)
            if (!res.isSuccess) return rejectWithValue('Fetch stations failed')
            return res.value.data
        } catch {
            return rejectWithValue('Fetch stations failed')
        }
    },
)

export const createStationThunk = createAsyncThunk(
    'stations/create',
    async (payload: CreateStationRequest, { rejectWithValue }) => {
        try {
            const res = await api.createStation(payload)
            if (!res.isSuccess) return rejectWithValue('Create station failed')
            return res.value.data
        } catch {
            return rejectWithValue('Create station failed')
        }
    },
)

export const updateStationThunk = createAsyncThunk(
    'stations/update',
    async (payload: UpdateStationRequest, { rejectWithValue }) => {
        try {
            const res = await api.updateStation(payload)
            if (!res.isSuccess) return rejectWithValue('Update station failed')
            return res.value.data
        } catch {
            return rejectWithValue('Update station failed')
        }
    },
)

export const deleteStationThunk = createAsyncThunk(
    'stations/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.deleteStation(id)
            if (!res.isSuccess) return rejectWithValue('Delete station failed')
            return id
        } catch {
            return rejectWithValue('Delete station failed')
        }
    },
)

const stationsSlice = createSlice({
    name: 'stations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStations.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchStations.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                const { ...rest } = action.payload
                state.page = rest
            })
            .addCase(fetchStations.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch stations failed')
            })
            .addCase(createStationThunk.fulfilled, (state, action) => {
                state.items.unshift(action.payload)
            })
            .addCase(updateStationThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex((s) => s.id === action.payload.id)
                if (idx !== -1) state.items[idx] = action.payload
            })
            .addCase(deleteStationThunk.fulfilled, (state, action) => {
                state.items = state.items.filter((s) => s.id !== action.payload)
            })
    },
})

export default stationsSlice.reducer


