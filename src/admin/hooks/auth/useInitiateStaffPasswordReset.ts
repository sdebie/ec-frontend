import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface InitiateStaffPasswordResetRequest {
  email: string
}

export function useInitiateStaffPasswordReset() {
  return useMutation({
    mutationFn: (payload: InitiateStaffPasswordResetRequest) =>
      adminHttpClient.post('/admin/auth/password-reset/initiate', payload).then((r) => r.data),
  })
}
