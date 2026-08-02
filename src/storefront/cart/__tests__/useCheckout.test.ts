import {act, renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useCartStore} from '../store/cartStore.ts'
import {useCheckoutSessionStore} from '@/storefront/checkout/checkoutSessionStore'
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
        vi.clearAllMocks()
        useCheckoutSessionStore.getState().clearSession()
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
            expect(mockNavigate).toHaveBeenCalledWith('/checkout?orderId=order-abc')
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
})
