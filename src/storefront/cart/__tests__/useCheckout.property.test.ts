import {act, renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import * as fc from 'fast-check'
import {useCartStore} from '../store/cartStore'
import {useCheckout} from '../hooks/useCheckout'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

/**
 * Feature: cart-store, Property 7: Checkout request shape contains no prices
 *
 * For any non-empty set of CartLineItems, when the checkout action is triggered,
 * the request body sent to POST /api/orders SHALL contain only
 * { items: [{ variantId, quantity }] }. No price, total, VAT, customerType, or
 * other monetary/identity field SHALL appear in the request payload.
 *
 */

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

// Generator: CartLineItem with non-empty strings and positive quantity
const cartLineItemArb = fc.record({
    variantId: fc.string({minLength: 1}),
    productName: fc.string({minLength: 1}),
    variantLabel: fc.string({minLength: 1}),
    quantity: fc.nat().map((n) => n + 1),
})

// Generator: non-empty array of CartLineItems (1–10 items)
const cartItemsArb = fc.array(cartLineItemArb, {minLength: 1, maxLength: 10})

// Fields that must NOT appear anywhere in the serialized request body
const forbiddenFields = [
    'price',
    'total',
    'vat',
    'vatAmount',
    'customerType',
    'subtotal',
    'lineTotal',
    'unitPrice',
    'grandTotal',
    'shippingEstimate',
]

describe('useCheckout — Property 7: Checkout request shape contains no prices', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('for any non-empty set of CartLineItems, request body contains only { items: [{ variantId, quantity }] } with no monetary/identity fields', async () => {
        await fc.assert(
            fc.asyncProperty(cartItemsArb, async (items) => {
                // Reset store and mocks for each iteration
                vi.clearAllMocks()
                const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
                useCartStore.setState({items, itemCount})

                mockPost.mockResolvedValueOnce({
                    data: {
                        orderId: 'mock-order-uuid',
                        sessionId: 'mock-session-uuid',
                        lines: [],
                        subtotal: 0,
                        vatAmount: 0,
                        shippingEstimate: 0,
                        grandTotal: 0,
                    },
                })

                const wrapper = createWrapper()
                const {result} = renderHook(() => useCheckout(), {wrapper})

                await act(async () => {
                    result.current.checkout()
                })

                await waitFor(() => expect(mockPost).toHaveBeenCalledTimes(1))

                const [, body] = mockPost.mock.calls[0]

                // Assert: request body has only the `items` key
                const topLevelKeys = Object.keys(body)
                expect(topLevelKeys).toEqual(['items'])

                // Assert: items is an array with correct length
                expect(Array.isArray(body.items)).toBe(true)
                expect(body.items.length).toBe(items.length)

                // Assert: each item in the items array has only `variantId` and `quantity` keys
                for (const requestItem of body.items) {
                    const itemKeys = Object.keys(requestItem).sort()
                    expect(itemKeys).toEqual(['quantity', 'variantId'])
                }

                // Assert: no forbidden field appears anywhere in the serialized body
                const serialized = JSON.stringify(body)
                for (const field of forbiddenFields) {
                    expect(serialized).not.toContain(`"${field}"`)
                }
            }),
            {numRuns: 100},
        )
    })
})
