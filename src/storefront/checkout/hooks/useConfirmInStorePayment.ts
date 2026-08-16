import {useMutation} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

interface InStorePaymentResponse {
    orderId: string
    status: string
}

/**
 * Confirms an order the shopper will pay for on collection — the in-store
 * counterpart of handing off to PayFast.
 *
 * Not optional, and not merely cosmetic. An order left at CREATED is
 * indistinguishable from an abandoned cart, and the server's stock-recovery
 * sweep cancels those once the hold window passes — so without this call the
 * shopper's order is cancelled out from under them and staff never see it
 * waiting for collection.
 */
export function useConfirmInStorePayment() {
    return useMutation({
        mutationFn: async ({orderId, token}: { orderId: string; token: string }) => {
            const {data} = await storefrontHttpClient.post<InStorePaymentResponse>(
                `/orders/${orderId}/in-store-payment`,
                undefined,
                {headers: {'X-Order-Token': token}}
            )
            return data
        },
    })
}
