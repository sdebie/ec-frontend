import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface AdminResetPasswordRequest {
  email: string
  password: string
  confirmPassword: string
}

export function useAdminResetPassword() {
  return useMutation({
    mutationFn: (payload: AdminResetPasswordRequest) =>
      adminHttpClient.post('/admin/auth/reset-password', payload).then((r) => r.data),
  })
}
