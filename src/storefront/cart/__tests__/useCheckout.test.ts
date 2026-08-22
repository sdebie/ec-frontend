import {act, renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useCartStore} from '../store/cartStore'
import {useCheckoutSessionStore} from '@/storefront/checkout/store/checkoutSessionStore'
import {useCheckout} from '../hooks/useCheckout'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => mockNavigate}
})

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
    storefrontHttpClient: {
        post: vi.fn(),
    },
}))

const mockPost = storefrontHttpClient.post as ReturnType<typeof vi.fn>

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {mutations: {retry: false}},
    })
    return ({children}: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

describe('useCheckout', () => {
    beforeEach(() => {
        // resetAllMocks, not clearAllMocks: clearAllMocks leaves queued
        // mockResolvedValueOnce/mockRejectedValueOnce values in place, and a test
        // whose implementation doesn't consume every queued response it set up
        // (e.g. an auto-retry that isn't wired yet) leaks its leftover response
        // into the next test's first call.
        vi.resetAllMocks()
        // clearOrder(), not clearCheckoutIntent(): guest-order-authorization
        // narrowed clearCheckoutIntent() to the idempotency key alone, so it no
        // longer resets `session` between tests — this suite needs the full reset
        // for isolation.
        useCheckoutSessionStore.getState().clearOrder()
        useCartStore.setState({
            items: [
                {
                    variantId: 'variant-1',
                    productName: 'Product A',
                    variantLabel: 'Red / M',
                    quantity: 2,
                },
                {
                    variantId: 'variant-2',
                    productName: 'Product B',
                    variantLabel: 'Blue / L',
                    quantity: 1,
                },
            ],
            itemCount: 3,
        })
    })

    it('sends correct request shape (variantId + quantity only, no prices)', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                orderId: 'order-123',
                sessionId: 'session-456',
                lines: [],
                subtotal: 300,
                vatAmount: 45,
                shippingEstimate: 99,
                grandTotal: 444,
            },
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        await act(async () => {
            result.current.checkout()
        })

        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1))

        const [url, body] = mockPost.mock.calls[0]
        expect(url).toBe('/orders')
        expect(body).toEqual({
            items: [
                {variantId: 'variant-1', quantity: 2},
                {variantId: 'variant-2', quantity: 1},
            ],
        })
        // Ensure no price fields are present
        expect(JSON.stringify(body)).not.toContain('price')
        expect(JSON.stringify(body)).not.toContain('total')
    })

    it('navigates on success (201) and populates checkoutSessionStore', async () => {
        const responseData = {
            orderId: 'order-abc',
            sessionId: 'session-xyz',
            lines: [],
            subtotal: 200,
            vatAmount: 30,
            shippingEstimate: 99,
            grandTotal: 329,
        }

        mockPost.mockResolvedValueOnce({data: responseData})

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        await act(async () => {
            result.current.checkout()
        })

        await waitFor(() => {
            // No identifier in the URL (Requirement 3.5) — /checkout reads the order
            // from checkoutSessionStore.
            expect(mockNavigate).toHaveBeenCalledWith('/checkout')
        })

        // Cart is cleared by CheckoutSuccessPage after payment confirmed — not here
        expect(useCartStore.getState().items).toHaveLength(2)

        // Verify checkoutSessionStore was populated before navigation
        const session = useCheckoutSessionStore.getState().session
        expect(session).toEqual(responseData)
    })

    it('sets unavailableVariantIds on 422 error', async () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                status: 422,
                data: {unavailableVariantIds: ['variant-1']},
            },
        }
        mockPost.mockRejectedValueOnce(axiosError)

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        await act(async () => {
            result.current.checkout()
        })

        await waitFor(() => {
            expect(result.current.unavailableVariantIds).toEqual(['variant-1'])
        })

        expect(result.current.error).toBeNull()
        // Cart should NOT be cleared
        expect(useCartStore.getState().items).toHaveLength(2)
    })

    it('tells the shopper to wait on 429 rather than to retry', async () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                status: 429,
                data: {},
            },
        }
        mockPost.mockRejectedValueOnce(axiosError)

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        await act(async () => {
            result.current.checkout()
        })

        // The generic copy invites the one action that cannot succeed while the
        // window is open, and every retry extends it.
        await waitFor(() => {
            expect(result.current.error).not.toBeNull()
        })
        expect(result.current.error).not.toBe('Something went wrong — please try again')
        expect(result.current.error).toMatch(/too many/i)

        expect(result.current.unavailableVariantIds).toEqual([])
        expect(useCartStore.getState().items).toHaveLength(2)
    })

    it('sets generic error message on other errors', async () => {
        const axiosError = {
            isAxiosError: true,
            response: {
                status: 500,
                data: {},
            },
        }
        mockPost.mockRejectedValueOnce(axiosError)

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        await act(async () => {
            result.current.checkout()
        })

        await waitFor(() => {
            expect(result.current.error).toBe('Something went wrong — please try again')
        })

        expect(result.current.unavailableVariantIds).toEqual([])
        // Cart should NOT be cleared
        expect(useCartStore.getState().items).toHaveLength(2)
    })

    it('sets isLoading to true while the mutation is pending', async () => {
        let resolvePost: (value: unknown) => void
        mockPost.mockImplementationOnce(
            () => new Promise((resolve) => {
                resolvePost = resolve
            })
        )

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})

        expect(result.current.isLoading).toBe(false)

        act(() => {
            result.current.checkout()
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true)
        })

        await act(async () => {
            resolvePost!({
                data: {
                    orderId: 'order-loading',
                    sessionId: 'sess',
                    lines: [],
                    subtotal: 0,
                    vatAmount: 0,
                    shippingEstimate: 0,
                    grandTotal: 0,
                },
            })
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    function keyHeaderOf(callIndex: number): string {
        const [, , config] = mockPost.mock.calls[callIndex]
        return config?.headers?.['Idempotency-Key']
    }

    it('sends an Idempotency-Key header', async () => {
        mockPost.mockResolvedValueOnce({
            data: {
                orderId: 'o1',
                sessionId: 's1',
                lines: [],
                subtotal: 0,
                vatAmount: 0,
                shippingEstimate: 0,
                grandTotal: 0
            },
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())
        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1))

        expect(keyHeaderOf(0)).toBeTruthy()
    })

    it('sends the same key on a retry of one intent (cart unchanged)', async () => {
        mockPost.mockRejectedValueOnce({isAxiosError: true, response: {status: 500, data: {}}})
        mockPost.mockResolvedValueOnce({
            data: {
                orderId: 'o1',
                sessionId: 's1',
                lines: [],
                subtotal: 0,
                vatAmount: 0,
                shippingEstimate: 0,
                grandTotal: 0
            },
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())
        await waitFor(() => expect(result.current.error).not.toBeNull())

        await act(async () => result.current.checkout())
        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(2))

        expect(keyHeaderOf(0)).toBe(keyHeaderOf(1))
    })

    it('sends a different key after the cart changes', async () => {
        mockPost.mockRejectedValueOnce({isAxiosError: true, response: {status: 500, data: {}}})
        mockPost.mockResolvedValueOnce({
            data: {
                orderId: 'o1',
                sessionId: 's1',
                lines: [],
                subtotal: 0,
                vatAmount: 0,
                shippingEstimate: 0,
                grandTotal: 0
            },
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())
        await waitFor(() => expect(result.current.error).not.toBeNull())

        useCartStore.setState({
            items: [{variantId: 'variant-1', productName: 'Product A', variantLabel: 'Red / M', quantity: 5}],
            itemCount: 5,
        })

        await act(async () => result.current.checkout())
        await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(2))

        expect(keyHeaderOf(0)).not.toBe(keyHeaderOf(1))
    })

    it.each(['IDEMPOTENCY_KEY_EXPIRED', 'IDEMPOTENCY_CART_MISMATCH', 'IDEMPOTENCY_ORDER_VOIDED'])(
        'on %s: clears the stored key and automatically resubmits with a fresh one',
        async (code) => {
            mockPost.mockRejectedValueOnce({isAxiosError: true, response: {status: 409, data: {code}}})
            mockPost.mockResolvedValueOnce({
                data: {
                    orderId: 'o1',
                    sessionId: 's1',
                    lines: [],
                    subtotal: 0,
                    vatAmount: 0,
                    shippingEstimate: 0,
                    grandTotal: 0
                },
            })

            const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
            await act(async () => result.current.checkout())

            // Recoverable and invisible to the shopper: no click needed, and it lands on success.
            await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/checkout'))
            expect(mockPost).toHaveBeenCalledTimes(2)
            expect(keyHeaderOf(0)).not.toBe(keyHeaderOf(1))
        }
    )

    it('on IDEMPOTENCY_WRONG_OWNER: does NOT clear the key and does NOT auto-resubmit', async () => {
        mockPost.mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 409, data: {code: 'IDEMPOTENCY_WRONG_OWNER'}},
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())

        await waitFor(() => expect(result.current.error).not.toBeNull())
        // Give any errant auto-retry a chance to have fired before asserting it didn't.
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(mockPost).toHaveBeenCalledTimes(1)
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('an unrecognised 409 code fails closed onto the wrong-owner behaviour (no auto-retry)', async () => {
        mockPost.mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 409, data: {code: 'SOME_FUTURE_CODE'}},
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())

        await waitFor(() => expect(result.current.error).not.toBeNull())
        await new Promise((resolve) => setTimeout(resolve, 0))

        expect(mockPost).toHaveBeenCalledTimes(1)
    })

    it('a 400 says to refresh, not to try again', async () => {
        mockPost.mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 400, data: 'Idempotency-Key header is required'}
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())

        await waitFor(() => expect(result.current.error).not.toBeNull())
        expect(result.current.error).not.toBe('Something went wrong — please try again')
        expect(result.current.error).toMatch(/refresh/i)
    })

    it('refuses a cart over the line cap before sending any request', async () => {
        useCartStore.setState({
            items: Array.from({length: 201}, (_, i) => ({
                variantId: `variant-${i}`,
                productName: 'P',
                variantLabel: 'L',
                quantity: 1,
            })),
            itemCount: 201,
        })

        const {result} = renderHook(() => useCheckout(), {wrapper: createWrapper()})
        await act(async () => result.current.checkout())

        expect(mockPost).not.toHaveBeenCalled()
        expect(result.current.error).not.toBeNull()
    })
})
