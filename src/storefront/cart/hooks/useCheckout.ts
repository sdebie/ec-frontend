import {useRef, useState} from 'react'
import {useMutation} from '@tanstack/react-query'
import {useNavigate} from 'react-router-dom'
import {AxiosError} from 'axios'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {useCartStore} from '../store/cartStore'
import {useCheckoutSessionStore} from '@/storefront/checkout/store/checkoutSessionStore'
import {cartSignature} from '@/storefront/checkout/utils/cartSignature'

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
    /** guest-order-authorization — required by every order-scoped request from here on. */
    orderToken: string
}

interface CheckoutError422 {
    unavailableVariantIds: string[]
}

interface IdempotencyErrorBody {
    code?: string
}

/**
 * Codes that mean "the client's fault, not the shopper's — drop the key,
 * mint a fresh one, resubmit automatically" (design §7). IDEMPOTENCY_WRONG_OWNER
 * is deliberately not here: a silent resubmit there would create a second order
 * for a caller who is not the order's owner.
 */
const RECOVERABLE_IDEMPOTENCY_CODES = new Set([
    'IDEMPOTENCY_KEY_EXPIRED',
    'IDEMPOTENCY_CART_MISMATCH',
    'IDEMPOTENCY_ORDER_VOIDED',
])

/**
 * Mirrors OrderService.MAX_ORDER_LINES. The server is the authority; this is
 * advisory so the shopper learns why before a request is even sent. Drift is
 * safe in one direction only — a lower number here means a premature refusal,
 * a higher number means a 400 the refresh branch below already handles — so
 * never raise this without raising the server's constant first.
 */
const MAX_ORDER_LINES = 200

export function useCheckout() {
    const navigate = useNavigate()
    const [unavailableVariantIds, setUnavailableVariantIds] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)
    // Bounds the automatic resubmit to one attempt per shopper-initiated click,
    // so a persistently failing key can never loop.
    const hasAutoRetried = useRef(false)

    const mutation = useMutation<CheckoutResponse, AxiosError, void>({
        mutationFn: async () => {
            const cartItems = useCartStore.getState().items
            const items = cartItems.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
            }))

            // Read, never generated, here: `checkout()` and the auto-resubmit
            // branch in onError both call ensureIdempotencyKey before mutate() is
            // ever invoked, so this is always already set by the time mutationFn
            // runs. A key minted per call here would be different on every retry
            // and would silently defeat the whole feature (design §7).
            const key = useCheckoutSessionStore.getState().idempotencyKey
            if (!key) {
                throw new Error('Idempotency key was not ensured before mutate() — this is a bug in useCheckout')
            }

            const request: CheckoutRequest = {items}
            const {data} = await storefrontHttpClient.post<CheckoutResponse>(
                '/orders',
                request,
                {headers: {'Idempotency-Key': key}}
            )
            return data
        },
        onSuccess: (data) => {
            hasAutoRetried.current = false
            setUnavailableVariantIds([])
            setError(null)
            useCheckoutSessionStore.getState().setSession(data)
            // No identifier in the URL (Requirement 3.5) — /checkout reads the order
            // from checkoutSessionStore, the only source now.
            navigate('/checkout')
        },
        onError: (err) => {
            const status = err.response?.status

            if (status === 422) {
                const responseData = err.response!.data as CheckoutError422
                setUnavailableVariantIds(responseData.unavailableVariantIds ?? [])
                setError(null)
                return
            }

            if (status === 429) {
                // Waiting is the only thing that clears this, and the window is a
                // fixed one, so "try again" would invite the one action that cannot
                // work yet. The cart is untouched, so there is nothing to redo.
                setUnavailableVariantIds([])
                setError('Too many checkout attempts — please wait a few minutes and try again')
                return
            }

            if (status === 409) {
                // Branch on the body's code, never the status or error's wording —
                // the three 409s here do not share a response (design §6/§7).
                const code = (err.response!.data as IdempotencyErrorBody | undefined)?.code

                if (code !== undefined && RECOVERABLE_IDEMPOTENCY_CODES.has(code) && !hasAutoRetried.current) {
                    hasAutoRetried.current = true
                    const store = useCheckoutSessionStore.getState()
                    store.clearIdempotencyKey()
                    store.ensureIdempotencyKey(cartSignature(useCartStore.getState().items))
                    setUnavailableVariantIds([])
                    setError(null)
                    mutation.mutate()
                    return
                }

                // IDEMPOTENCY_WRONG_OWNER, an unrecognised code, or a second
                // failure after the one automatic retry: do not auto-retry. Failing
                // closed on an unrecognised code is what keeps a future fifth 409
                // from silently creating duplicates.
                setUnavailableVariantIds([])
                setError('We could not confirm this order — please contact support if the problem continues')
                return
            }

            if (status === 400) {
                // The realistic cause is a stale bundle sent before the header was
                // required (Requirement 2.4's deployment window) — reloading is
                // what actually fixes that, so "try again" would be misleading.
                // Never branch on this body's wording: it is a bare string by
                // design, not a coded contract.
                setUnavailableVariantIds([])
                setError('Please refresh the page and try again')
                return
            }

            setUnavailableVariantIds([])
            setError('Something went wrong — please try again')
        },
    })

    return {
        checkout: () => {
            const itemCount = useCartStore.getState().items.length
            if (itemCount > MAX_ORDER_LINES) {
                setUnavailableVariantIds([])
                setError(`Your cart has too many items (max ${MAX_ORDER_LINES}) — remove some to check out`)
                return
            }
            hasAutoRetried.current = false
            useCheckoutSessionStore
                .getState()
                .ensureIdempotencyKey(cartSignature(useCartStore.getState().items))
            mutation.mutate()
        },
        isLoading: mutation.isPending,
        unavailableVariantIds,
        error,
    }
}
