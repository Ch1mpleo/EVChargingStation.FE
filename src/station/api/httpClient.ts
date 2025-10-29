import axios from 'axios'
import type { AxiosInstance } from 'axios'

const BASE_URL = 'http://localhost:5001/api'

export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

export default httpClient


