import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { mapShopperType } from '../utils/mapShopperType'
import { mergeWishlistOnSignIn } from '@/storefront/customer/account/wishlist/mergeWishlistOnSignIn'
import type { CustomerLoginResponse, CustomerRegisterRequest } from '../types'

export function useCustomerRegister() {
  const setSession = useCustomerAuthStore(s => s.setSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: CustomerRegisterRequest) => {
      const { data } = await storefrontHttpClient.post<CustomerLoginResponse>(
        '/customers/register',
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

      // Fire-and-forget: merge local wishlist into server wishlist
      mergeWishlistOnSignIn(queryClient)
    },
    onError(error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        // Account already exists — user should sign in instead
        throw new Error('An account with this email already exists. Please sign in.')
      }
    },
  })
}
