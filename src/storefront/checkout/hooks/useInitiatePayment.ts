import {useMutation} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import type {PayFastCheckoutResponse} from '../types'

/**
 * `email` is deliberately not part of this request (guest-order-authorization
 * Requirement 8) — the backend resolves the payer email from the order's own
 * contactEmail, never from a caller-supplied parameter, which used to let anyone
 * redirect the PayFast receipt to an address of their choosing.
 */
export function useInitiatePayment() {
    return useMutation({
        mutationFn: async (params: { orderId: string; token: string }) => {
            const {data} = await storefrontHttpClient.post<PayFastCheckoutResponse>(
                '/payments/checkout',
                new URLSearchParams({id: params.orderId}),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded', 'X-Order-Token': params.token}}
            )
            return data
        },
    })
}
