import axios from 'axios'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

const adminHttpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    timeout: 60_000,
})

adminHttpClient.interceptors.request.use((config) => {
    const token = useAdminAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

adminHttpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            useAdminAuthStore.getState().clearSession()
        }
        return Promise.reject(error)
    }
)

export {adminHttpClient}
