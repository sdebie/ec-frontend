import {useEffect} from 'react'
import {useQueryClient} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {
    CUSTOMER_PROFILE_ENDPOINT,
    CUSTOMER_PROFILE_QUERY_KEY,
} from '@/storefront/customer/account/hooks/useCustomerProfile'
import {mapShopperType} from '../utils/mapShopperType'
import type {StorefrontMeResponse} from '../types'

/**
 * Restores the signed-in customer's session from the persisted bearer token.
 *
 * `customerAuthStore` persists only the token, so after a reload the tier
 * (`customerType`) defaults to RETAIL until this resolves. Callers use
 * `isRestoring` to withhold price-bearing UI rather than paint a wrong figure.
 *
 * `customerType` is deliberately NOT persisted: a stored tier survives a
 * server-side upgrade or downgrade, so it must come from the server.
 *
 * Mount once at the storefront root — it covers the whole storefront, not just
 * the guarded account routes.
 *
 * Fetches directly rather than through `useCustomerProfile`: failure here means
 * "sign the visitor out", failure there means "show an error on a page", and
 * one query cannot carry both meanings or both retry policies. The response is
 * still written to `CUSTOMER_PROFILE_QUERY_KEY`, so a later account page reads
 * cache instead of repeating the request.
 */
export function useRestoreCustomerSession(): { isRestoring: boolean } {
    const token = useCustomerAuthStore((s) => s.token)
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const setSession = useCustomerAuthStore((s) => s.setSession)
    const clearSession = useCustomerAuthStore((s) => s.clearSession)
    const queryClient = useQueryClient()

    // Derived, not stored: a token with no session is an unrestored reload.
    // Both outcomes below settle it — success sets isSignedIn, failure clears
    // the token — so there is no separate flag to leave stranded on abort.
    const isRestoring = !!token && !isSignedIn

    useEffect(() => {
        if (!token || isSignedIn) return

        const controller = new AbortController()

        storefrontHttpClient
            .get<StorefrontMeResponse>(CUSTOMER_PROFILE_ENDPOINT, {
                signal: controller.signal,
            })
            .then(({data}) => {
                setSession({
                    token,
                    email: data.email,
                    customerType: mapShopperType(data.shopperType),
                })
                queryClient.setQueryData(CUSTOMER_PROFILE_QUERY_KEY, data)
            })
            .catch((err) => {
                if (err?.name === 'CanceledError') return
                console.error('[Auth] customer session restore failed:', err)
                clearSession()
            })

        return () => controller.abort()
    }, [token, isSignedIn, setSession, clearSession, queryClient])

    return {isRestoring}
}
