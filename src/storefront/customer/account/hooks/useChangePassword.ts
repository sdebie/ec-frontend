import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import type { ChangePasswordRequest } from '../types'
import type { AxiosError } from 'axios'

export function useChangePassword() {
  return useMutation<void, AxiosError, ChangePasswordRequest>({
    mutationFn: (payload: ChangePasswordRequest) =>
      storefrontHttpClient
        .patch('/customers/password', payload)
        .then(() => undefined),
  })
}
