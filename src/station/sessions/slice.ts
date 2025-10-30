import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type { GetSessionsQuery, Paged, Session } from './types'

export type SessionsState = {
  items: Session[]
  page: Omit<Paged<Session>, 'items'> | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: SessionsState = {
  items: [],
  page: null,
  status: 'idle',
  error: null,
}

export const fetchSessions = createAsyncThunk(
  'sessions/fetch',
  async (query: GetSessionsQuery, { rejectWithValue }) => {
    try {
      const res = await api.getSessions(query)
      if (!res.isSuccess) return rejectWithValue('Fetch sessions failed')
      return res.value.data
    } catch {
      return rejectWithValue('Fetch sessions failed')
    }
  },
)

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        const { ...rest } = action.payload
        state.page = rest
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = String(action.payload ?? 'Fetch sessions failed')
      })
  },
})

export default sessionsSlice.reducer

