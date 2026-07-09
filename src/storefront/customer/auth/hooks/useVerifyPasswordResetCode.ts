import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

export function useVerifyPasswordResetCode() {
  return useMutation({
    mutationFn: async (variables: { email: string; code: string }) => {
      const { data } = await storefrontHttpClient.post(
        '/customers/password-reset/verify',
        variables,
      )
      return data
    },
  })
}
