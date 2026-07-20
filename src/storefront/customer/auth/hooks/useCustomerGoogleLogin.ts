import { useMutation, useQueryClient } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { mapShopperType } from '../utils/mapShopperType'
import { mergeWishlistOnSignIn } from '@/storefront/customer/account/wishlist/mergeWishlistOnSignIn'
import type { CustomerLoginResponse } from '../types'

export function useCustomerGoogleLogin() {
  const setSession = useCustomerAuthStore(s => s.setSession)
  const queryClient = useQueryClient()

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

      // Fire-and-forget: merge local wishlist into server wishlist
      mergeWishlistOnSignIn(queryClient)
    },
  })
}
