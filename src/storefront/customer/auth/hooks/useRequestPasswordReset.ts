import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (variables: { email: string }) => {
      const { data } = await storefrontHttpClient.post(
        '/customers/password-reset/request',
        variables,
      )
      return data
    },
  })
}
