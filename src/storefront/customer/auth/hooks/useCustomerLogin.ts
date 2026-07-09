import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { mapShopperType } from '../utils/mapShopperType'
import type { CustomerLoginRequest, CustomerLoginResponse } from '../types'

export function useCustomerLogin() {
  const setSession = useCustomerAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: async (credentials: CustomerLoginRequest) => {
      const { data } = await storefrontHttpClient.post<CustomerLoginResponse>(
        '/customers/login',
        credentials,
      )
      return data
    },
    onSuccess(data) {
      setSession({
        token: data.token,
        email: data.email,
        customerType: mapShopperType(data.shopperType),
      })
    },
  })
}
