import {cleanup, render, within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import * as fc from 'fast-check'
import type {CartLineItem} from '../store/cartStore'
import {useCartStore} from '../store/cartStore'
import {CartPage} from '../CartPage'
import {useCartVariants} from '../hooks/useCartVariants'
import {useCheckout} from '../hooks/useCheckout'

/**
 * Feature: cart-store, Property 6: Cart row renders all required fields
 *
 * For any CartLineItem combined with fetched variant price data, the rendered cart row
 * SHALL contain: the product name, the variant label, a quantity stepper, an estimated
 * unit price, an estimated line total, and a remove button. No field SHALL be omitted
 * regardless of the input values.
 *
 */

// Mock useCartVariants to return controlled price data
vi.mock('../hooks/useCartVariants', () => ({
    useCartVariants: vi.fn(),
}))

// Mock useCheckout to avoid needing a real QueryClient for mutations
vi.mock('../hooks/useCheckout', () => ({
    useCheckout: vi.fn(),
}))

// Mock useStorefrontConfig to return currency/locale
vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

const mockedUseCartVariants = vi.mocked(useCartVariants)
const mockedUseCheckout = vi.mocked(useCheckout)

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

// Generator: CartLineItem with non-empty trimmed strings and positive quantity
// productName and variantLabel use prefixes to guarantee they remain distinct after
// DOM text normalization (Testing Library trims and collapses whitespace)
const cartLineItemArb = fc.record({
    variantId: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
    productName: fc
        .string({minLength: 1, maxLength: 40})
        .filter((s) => s.trim().length > 0)
        .map((s) => `Product: ${s.trim()}`),
    variantLabel: fc
        .string({minLength: 1, maxLength: 40})
        .filter((s) => s.trim().length > 0)
        .map((s) => `Variant: ${s.trim()}`),
    quantity: fc.nat().map((n) => n + 1), // positive integer >= 1
})

// Generator: price as a positive float (use integer cents to avoid formatting issues)
const priceArb = fc.integer({min: 1, max: 9999900}).map((cents) => cents / 100)

describe('CartPage — Property 6: Cart row renders all required fields', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
        mockedUseCheckout.mockReturnValue({
            checkout: vi.fn(),
            isLoading: false,
            unavailableVariantIds: [],
            error: null,
        })
    })

    afterEach(() => {
        cleanup()
    })

    it('for any CartLineItem + variant price data, the rendered row contains product name, variant label, quantity stepper, price, line total, and remove button', () => {
        fc.assert(
            fc.property(cartLineItemArb, priceArb, (item: CartLineItem, price: number) => {
                // Clean up any previous render
                cleanup()

                // Set up cart state with the generated item
                useCartStore.setState({items: [item], itemCount: item.quantity})

                // Mock useCartVariants to return variant data for this item
                const variantsMap = new Map()
                variantsMap.set(item.variantId, {
                    id: item.variantId,
                    sku: 'SKU-1',
                    stockQuantity: null,
                    status: 'ACTIVE',
                    displayPrice: price,
                    images: [],
                })

                mockedUseCartVariants.mockReturnValue({
                    variants: variantsMap,
                    unavailableIds: [],
                    isLoading: false,
                    isError: false,
                })

                const queryClient = createQueryClient()
                const {container} = render(
                    <QueryClientProvider client={queryClient}>
                        <MemoryRouter>
                            <CartPage/>
                        </MemoryRouter>
                    </QueryClientProvider>
                )

                const lineItemRows = container.querySelectorAll('[data-testid="cart-line-item"]')
                expect(lineItemRows.length).toBe(1)
                const row = lineItemRows[0] as HTMLElement

                // 1. Product name text is displayed in the row
                const normalizedProductName = item.productName.replace(/\s+/g, ' ').trim()
                expect(
                    within(row).getByText((_content, element) => {
                        return element?.textContent?.replace(/\s+/g, ' ').trim() === normalizedProductName
                    })
                ).toBeInTheDocument()

                // 2. Variant label text is displayed in the row
                const normalizedVariantLabel = item.variantLabel.replace(/\s+/g, ' ').trim()
                expect(
                    within(row).getByText((_content, element) => {
                        return element?.textContent?.replace(/\s+/g, ' ').trim() === normalizedVariantLabel
                    })
                ).toBeInTheDocument()

                // 3. Quantity stepper (increment and decrement buttons)
                expect(
                    within(row).getByRole('button', {name: /increase quantity/i})
                ).toBeInTheDocument()
                expect(
                    within(row).getByRole('button', {name: /decrease quantity/i})
                ).toBeInTheDocument()

                // 4. The unit price and the line total, each formatted and each present
                // jest-dom normalizes whitespace before comparing, so the
                // narrow no-break space Intl emits has to be normalized here too.
                const format = (amount: number) =>
                    new Intl.NumberFormat('en-ZA', {
                        style: 'currency',
                        currency: 'ZAR',
                    })
                        .format(amount)
                        .replace(/\s/g, ' ')

                expect(within(row).getByTestId('cart-unit-price')).toHaveTextContent(
                    format(price),
                )
                expect(within(row).getByTestId('cart-line-total')).toHaveTextContent(
                    format(price * item.quantity),
                )

                // 5. Remove button (with aria-label containing "Remove")
                expect(
                    within(row).getByRole('button', {name: /remove/i})
                ).toBeInTheDocument()

                // Cleanup after this iteration
                cleanup()
            }),
            {numRuns: 100}
        )
        // 100 full page renders; the default 5s budget is not enough for this
        // one under a loaded parallel suite.
    }, 30_000)
})
