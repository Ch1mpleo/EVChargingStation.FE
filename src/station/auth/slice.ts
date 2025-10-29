import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as authApi from './api'
import type {
    LoginRequest,
    TokenPair,
    RefreshTokenRequest,
} from './types'
import { tokenStorage } from '../../utils/tokenStorage'

export type AuthState = {
    accessToken: string | null
    refreshToken: string | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: AuthState = {
    accessToken: tokenStorage.getAccessToken(),
    refreshToken: tokenStorage.getRefreshToken(),
    status: 'idle',
    error: null,
}

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (payload: LoginRequest, { rejectWithValue }) => {
    try {
            const res = await authApi.login(payload)
            if (!res.isSuccess) return rejectWithValue('Login failed')
            return res.value.data
    } catch {
            return rejectWithValue('Login failed')
        }
    },
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
    const res = await authApi.logout()
    return res.isSuccess && res.value.data === true
})

export const refreshTokenThunk = createAsyncThunk(
    'auth/refreshToken',
    async (payload: RefreshTokenRequest, { rejectWithValue }) => {
    try {
            const res = await authApi.refreshToken(payload)
            if (!res.isSuccess) return rejectWithValue('Refresh failed')
            return res.value.data
    } catch {
            return rejectWithValue('Refresh failed')
        }
    },
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setTokens(state, action: PayloadAction<TokenPair | null>) {
            if (action.payload) {
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken)
            } else {
                state.accessToken = null
                state.refreshToken = null
                tokenStorage.clearTokens()
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken)
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = 'failed'
                state.error = String(action.payload ?? 'Login failed')
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.accessToken = null
                state.refreshToken = null
                state.status = 'idle'
                tokenStorage.clearTokens()
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken)
            })
    },
})

export const { setTokens } = authSlice.actions
export default authSlice.reducer


