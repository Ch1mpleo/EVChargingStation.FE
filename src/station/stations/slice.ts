import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type { StationWithConnectors } from './types'

export type StationsState = {
    stationsWithConnectors: StationWithConnectors[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: StationsState = {
    stationsWithConnectors: [],
    status: 'idle',
    error: null,
}

export const fetchStationsWithConnectors = createAsyncThunk(
    'stations/fetchWithConnectors',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.getStationsWithConnectors()
            if (!res.isSuccess) return rejectWithValue('Fetch stations failed')
            return res.value.data
        } catch {
            return rejectWithValue('Fetch stations failed')
        }
    },
)

const stationsSlice = createSlice({
    name: 'stations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStationsWithConnectors.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchStationsWithConnectors.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.stationsWithConnectors = action.payload
            })
            .addCase(fetchStationsWithConnectors.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch stations failed')
            })
    },
})

export default stationsSlice.reducer

