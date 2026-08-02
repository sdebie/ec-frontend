import {useState} from 'react'
import {useMutation} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {AxiosError} from 'axios'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {useCartStore} from '../store/cartStore'
import {useCheckoutSessionStore} from '@/storefront/checkout/checkoutSessionStore'

interface CheckoutRequest {
    items: Array<{ variantId: string; quantity: number }>
}

interface CheckoutResponse {
    orderId: string
    sessionId: string
    lines: Array<{
        variantId: string
        name: string
        unitPrice: number
        quantity: number
        lineTotal: number
    }>
    subtotal: number
    vatAmount: number
    shippingEstimate: number
    grandTotal: number
}

interface CheckoutError422 {
    unavailableVariantIds: string[]
}

export function useCheckout() {
    const navigate = useNavigate()
    const [unavailableVariantIds, setUnavailableVariantIds] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation<CheckoutResponse, AxiosError, void>({
        mutationFn: async () => {
            const items = useCartStore.getState().items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }))

            const request: CheckoutRequest = {items}
            const {data} = await storefrontHttpClient.post<CheckoutResponse>(
                '/orders',
                request
            )
            return data
        },
        onSuccess: (data) => {
            setUnavailableVariantIds([])
            setError(null)
            useCheckoutSessionStore.getState().setSession(data)
            navigate(`/checkout?orderId=${data.orderId}`)
        },
        onError: (err) => {
            console.error('[Checkout] order submission failed:', err)
            if (err.response?.status === 422) {
                const responseData = err.response.data as CheckoutError422
                setUnavailableVariantIds(responseData.unavailableVariantIds ?? [])
                setError(null)
            } else {
                setUnavailableVariantIds([])
                setError('Something went wrong — please try again')
            }
        },
    })

    return {
        checkout: () => mutation.mutate(),
        isLoading: mutation.isPending,
        unavailableVariantIds,
        error,
    }
}
