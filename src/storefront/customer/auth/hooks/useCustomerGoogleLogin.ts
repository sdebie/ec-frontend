import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { mapShopperType } from '../utils/mapShopperType'
import type { CustomerLoginResponse } from '../types'

export function useCustomerGoogleLogin() {
  const setSession = useCustomerAuthStore(s => s.setSession)

  return useMutation({
    mutationFn: async (credential: string) => {
      const { data } = await storefrontHttpClient.post<CustomerLoginResponse>(
        '/customers/login/google',
        { idToken: credential },
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
