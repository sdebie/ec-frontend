import {useMutation} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import type {PayFastCheckoutResponse} from '../types'

export function useInitiatePayment() {
    return useMutation({
        mutationFn: async (params: { orderId: string; email: string }) => {
            const {data} = await storefrontHttpClient.post<PayFastCheckoutResponse>(
                '/payments/checkout',
                new URLSearchParams({id: params.orderId, email: params.email}),
                {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
            )
            return data
        },
    })
}
