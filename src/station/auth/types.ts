export type ApiEnvelope<T> = {
    isSuccess: boolean
    value: {
        code: string
        message: string
        data: T
    }
    error: unknown | null
}

export type LoginRequest = {
    email: string
    password: string
}

export type TokenPair = {
    accessToken: string
    refreshToken: string
}

export type LoginResponse = ApiEnvelope<TokenPair>

export type LogoutResponse = ApiEnvelope<boolean>

export type RefreshTokenRequest = {
    refreshToken: string
}

export type RefreshTokenResponse = ApiEnvelope<TokenPair>


