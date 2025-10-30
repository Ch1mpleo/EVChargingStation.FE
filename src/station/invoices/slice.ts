import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'
import type {
  CreateInvoiceFromSessionRequest,
  GetInvoicesQuery,
  Invoice,
  Paged,
  PayInvoiceRequest,
  UpdateInvoiceRequest,
} from './types'

export type InvoicesState = {
  items: Invoice[]
  page: Omit<Paged<Invoice>, 'items'> | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: InvoicesState = {
  items: [],
  page: null,
  status: 'idle',
  error: null,
}

export const fetchInvoices = createAsyncThunk(
  'invoices/fetch',
  async (query: GetInvoicesQuery, { rejectWithValue }) => {
    try {
      const res = await api.getInvoices(query)
      if (!res.isSuccess) return rejectWithValue('Fetch invoices failed')
      return res.value.data
    } catch {
      return rejectWithValue('Fetch invoices failed')
    }
  },
)

export const createInvoiceFromSessionThunk = createAsyncThunk(
  'invoices/createFromSession',
  async (payload: CreateInvoiceFromSessionRequest, { rejectWithValue }) => {
    try {
      const res = await api.createInvoiceFromSession(payload)
      if (!res.isSuccess) return rejectWithValue('Create invoice failed')
      return res.value.data
    } catch {
      return rejectWithValue('Create invoice failed')
    }
  },
)

export const updateInvoiceThunk = createAsyncThunk(
  'invoices/update',
  async (payload: UpdateInvoiceRequest, { rejectWithValue }) => {
    try {
      const res = await api.updateInvoice(payload)
      if (!res.isSuccess) return rejectWithValue('Update invoice failed')
      return res.value.data
    } catch {
      return rejectWithValue('Update invoice failed')
    }
  },
)

export const deleteInvoiceThunk = createAsyncThunk(
  'invoices/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.deleteInvoice(id)
      if (!res.isSuccess) return rejectWithValue('Delete invoice failed')
      return id
    } catch {
      return rejectWithValue('Delete invoice failed')
    }
  },
)

export const payInvoiceThunk = createAsyncThunk(
  'invoices/pay',
  async (payload: PayInvoiceRequest, { rejectWithValue }) => {
    try {
      const res = await api.payInvoice(payload)
      if (!res.isSuccess) return rejectWithValue('Pay invoice failed')
      return res.value.data
    } catch {
      return rejectWithValue('Pay invoice failed')
    }
  },
)

export const cancelInvoiceThunk = createAsyncThunk(
  'invoices/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.cancelInvoice(id)
      if (!res.isSuccess) return rejectWithValue('Cancel invoice failed')
      return res.value.data
    } catch {
      return rejectWithValue('Cancel invoice failed')
    }
  },
)

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        const { ...rest } = action.payload
        state.page = rest
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = String(action.payload ?? 'Fetch invoices failed')
      })
      .addCase(createInvoiceFromSessionThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateInvoiceThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteInvoiceThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload)
      })
      .addCase(payInvoiceThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(cancelInvoiceThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
  },
})

export default invoicesSlice.reducer

