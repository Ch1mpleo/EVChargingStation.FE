import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { tokenStorage } from '../../utils/tokenStorage'

const BASE_URL = 'http://localhost:5001/api'

export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Request interceptor to attach JWT token
httpClient.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for token refresh on 401
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = tokenStorage.getRefreshToken()
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                        refreshToken,
                    })

                    if (data.isSuccess) {
                        const { accessToken, refreshToken: newRefreshToken } = data.value.data
                        tokenStorage.setTokens(accessToken, newRefreshToken)

                        originalRequest.headers.Authorization = `Bearer ${accessToken}`
                        return httpClient(originalRequest)
                    }
                } catch {
                    tokenStorage.clearTokens()
                    window.location.href = '/login'
                }
            } else {
                tokenStorage.clearTokens()
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default httpClient


