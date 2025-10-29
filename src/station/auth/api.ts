import httpClient from '../api/httpClient'
import type {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
} from './types'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', payload)
    return data
}

export async function logout(): Promise<LogoutResponse> {
    const { data } = await httpClient.post<LogoutResponse>('/auth/logout')
    return data
}

export async function refreshToken(
    payload: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
    const { data } = await httpClient.post<RefreshTokenResponse>(
        '/auth/refresh-token',
        payload,
    )
    return data
}


