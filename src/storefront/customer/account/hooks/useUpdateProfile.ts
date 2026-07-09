import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { mapShopperType } from '../../auth/utils/mapShopperType'
import type { UpdateProfileRequest, UpdateProfileResponse } from '../types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { setSession, token, customerType } = useCustomerAuthStore()

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) =>
      storefrontHttpClient
        .post<UpdateProfileResponse>('/customers/registerOrUpdate', payload)
        .then((r) => r.data),
    onSuccess(data) {
      // Update store so header shows updated name immediately
      setSession({
        token: token!,
        email: data.email,
        customerType: customerType ?? mapShopperType(data.shopperType),
        firstName: data.firstName,
        lastName: data.lastName,
      })
      // Invalidate profile cache so next visit fetches fresh data
      queryClient.invalidateQueries({ queryKey: ['customer', 'profile'] })
    },
  })
}
