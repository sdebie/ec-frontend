import axios from 'axios'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'

const storefrontHttpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    timeout: 60_000,
})

storefrontHttpClient.interceptors.request.use((config) => {
    const token = useCustomerAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

storefrontHttpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            useCustomerAuthStore.getState().clearSession()
        }
        return Promise.reject(error)
    }
)

export {storefrontHttpClient}
