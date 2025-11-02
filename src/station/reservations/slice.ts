import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type {
    CreateReservationRequest,
    GetReservationsQuery,
    Paged,
    Reservation,
    UpdateReservationRequest,
} from './types'

export type ReservationsState = {
    items: Reservation[]
    page: Omit<Paged<Reservation>, 'items'> | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: ReservationsState = {
    items: [],
    page: null,
    status: 'idle',
    error: null,
}

export const fetchReservations = createAsyncThunk(
    'reservations/fetch',
    async (query: GetReservationsQuery, { rejectWithValue }) => {
        try {
            const res = await api.getReservations(query)
            if (!res.isSuccess) return rejectWithValue('Fetch reservations failed')
            return res.value.data
        } catch {
            return rejectWithValue('Fetch reservations failed')
        }
    },
)

export const getReservationByIdThunk = createAsyncThunk(
    'reservations/getById',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.getReservationById(id)
            if (!res.isSuccess) return rejectWithValue('Get reservation failed')
            return res.value.data
        } catch {
            return rejectWithValue('Get reservation failed')
        }
    },
)

export const createReservationThunk = createAsyncThunk(
    'reservations/create',
    async (payload: CreateReservationRequest, { rejectWithValue }) => {
        try {
            const res = await api.createReservation(payload)
            if (!res.isSuccess) return rejectWithValue('Create reservation failed')
            return res.value.data
        } catch {
            return rejectWithValue('Create reservation failed')
        }
    },
)

export const updateReservationThunk = createAsyncThunk(
    'reservations/update',
    async (payload: UpdateReservationRequest, { rejectWithValue }) => {
        try {
            const res = await api.updateReservation(payload)
            if (!res.isSuccess) return rejectWithValue('Update reservation failed')
            return res.value.data
        } catch {
            return rejectWithValue('Update reservation failed')
        }
    },
)

export const cancelReservationThunk = createAsyncThunk(
    'reservations/cancel',
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.cancelReservation(id)
            if (!res.isSuccess) return rejectWithValue('Cancel reservation failed')
            return id
        } catch {
            return rejectWithValue('Cancel reservation failed')
        }
    },
)

const reservationsSlice = createSlice({
    name: 'reservations',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReservations.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchReservations.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload.items
                const { ...rest } = action.payload
                state.page = rest
            })
            .addCase(fetchReservations.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Fetch reservations failed')
            })
            .addCase(createReservationThunk.fulfilled, () => {
                // Refresh will be handled by refetch
            })
            .addCase(updateReservationThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex((r) => r.id === action.payload.id)
                if (idx !== -1) {
                    // Update the reservation in the list
                    state.items[idx] = {
                        ...state.items[idx],
                        ...action.payload,
                    }
                }
            })
            .addCase(cancelReservationThunk.fulfilled, (state, action) => {
                const idx = state.items.findIndex((r) => r.id === action.payload)
                if (idx !== -1) {
                    state.items[idx] = {
                        ...state.items[idx],
                        status: 'Cancelled',
                    }
                }
            })
    },
})

export default reservationsSlice.reducer

