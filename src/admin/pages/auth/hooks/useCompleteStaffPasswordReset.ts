import {useMutation} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'

interface CompleteStaffPasswordResetRequest {
    email: string
    code: string
    newPassword: string
    confirmPassword: string
}

export function useCompleteStaffPasswordReset() {
    return useMutation({
        mutationFn: (payload: CompleteStaffPasswordResetRequest) =>
            adminHttpClient.post('/admin/auth/password-reset/complete', payload).then((r) => r.data),
    })
}
