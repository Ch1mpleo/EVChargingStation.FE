import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type { GetLocationsQuery, Location, Paged } from './types'

export type LocationsState = {
    items: Location[]
    page: Omit<Paged<Location>, 'items'> | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: LocationsState = {
    items: [],
    page: null,
    status: 'idle',
    error: null,
}

export const fetchLocations = createAsyncThunk(
    'locations/fetch',
    async (query: GetLocationsQuery, { rejectWithValue }) => {
        try {
            const res = await api.getLocations(query)
            if (!res.isSuccess) return rejectWithValue('Fetch locations failed')
            return res.value.data
        } catch {
            return rejectWithValue('Fetch locations failed')
        }
    },
)

const locationsSlice = createSlice({
    name: 'locations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                const { items, ...rest } = action.payload
                state.page = rest
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch locations failed')
            })
    },
})

export default locationsSlice.reducer


