import {useMutation, useQueryClient} from '@tanstack/react-query'
import {ClientError, gql} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {OrderStatus} from '@/shared/types/enums/OrderStatus'

const UPDATE_ORDER_STATUS = gql`
    mutation UpdateOrderStatus(
        $orderId: String!
        $status: String!
        $trackingNumber: String
        $trackingCarrier: String
    ) {
        updateOrderStatus(
            orderId: $orderId
            status: $status
            trackingNumber: $trackingNumber
            trackingCarrier: $trackingCarrier
        ) {
            id
            status
        }
    }
`

interface UpdateOrderStatusParams {
    orderId: string
    status: OrderStatus
    trackingNumber?: string
    trackingCarrier?: string
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
                               orderId,
                               status,
                               trackingNumber,
                               trackingCarrier,
                           }: UpdateOrderStatusParams) => {
            await adminGraphqlClient.request(UPDATE_ORDER_STATUS, {
                orderId,
                status,
                trackingNumber: trackingNumber || null,
                trackingCarrier: trackingCarrier || null,
            })
        },
        onSuccess: () => {
            // Prefix-matching covers the list, its count and the detail view, all of
            // which live under ['admin','orders', …].
            queryClient.invalidateQueries({queryKey: ['admin', 'orders']})
            toast.success('Order status updated')
        },
        onError: (error) => {
            // The server rejects a disallowed transition and a lost concurrent claim
            // with messages staff need to act on ("refresh and try again"), so show
            // the real one rather than a generic failure.
            const message =
                error instanceof ClientError
                    ? error.response.errors?.[0]?.message ?? 'Failed to update order status'
                    : 'Failed to update order status'
            toast.error(message, {duration: 0})
        },
    })
}
