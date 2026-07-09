import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

interface CompletePasswordResetVariables {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}

export function useCompletePasswordReset() {
  return useMutation({
    mutationFn: async (variables: CompletePasswordResetVariables) => {
      const { data } = await storefrontHttpClient.post(
        '/customers/password-reset/complete',
        variables,
      )
      return data
    },
  })
}
