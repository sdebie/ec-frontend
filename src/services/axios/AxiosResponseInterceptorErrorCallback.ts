import { useSessionUser, useToken } from '@/store/authStore'
import type { AxiosError } from 'axios'

const unauthorizedCode = [401, 419, 440]

const AxiosResponseInterceptorErrorCallback = (error: AxiosError) => {
    const { response } = error
    const { setToken } = useToken()

    if (response && unauthorizedCode.includes(response.status)) {
        setToken('')
        useSessionUser.getState().setUser({
            token: "",
            username: "",
            role: ""
        })
        useSessionUser.getState().setSessionSignedIn(false)
    }
}

export default AxiosResponseInterceptorErrorCallback
