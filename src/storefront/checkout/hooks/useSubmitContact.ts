import {useMutation} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import type {ContactUpdateResponse, OrderContactPayload} from '../types'

export function useSubmitContact(orderId: string) {
    return useMutation({
        mutationFn: async (payload: OrderContactPayload) => {
            const {data} = await storefrontHttpClient.patch<ContactUpdateResponse>(
                `/orders/${orderId}/contact`,
                payload
            )
            return data
        },
    })
}
