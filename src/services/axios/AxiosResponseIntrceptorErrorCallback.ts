import type { AxiosError } from 'axios'
import { clearAuthSession } from '@/services/graphql/auth'
import { isUnauthorizedStatus } from '@/services/graphql/errors'

const AxiosResponseIntrceptorErrorCallback = (error: AxiosError) => {
    const { response } = error

    if (response && isUnauthorizedStatus(response.status)) {
        clearAuthSession()
    }
}

export default AxiosResponseIntrceptorErrorCallback
