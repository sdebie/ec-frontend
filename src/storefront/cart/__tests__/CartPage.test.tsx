import {fireEvent, render, screen, within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {CartPage} from '../CartPage'
import {useCartStore} from '../store/cartStore.ts'
import type {CartVariant} from '../hooks/useCartVariants'
import {useCartVariants} from '../hooks/useCartVariants'
import {useCheckout} from '../hooks/useCheckout'

vi.mock('../hooks/useCartVariants', () => ({
    useCartVariants: vi.fn(),
}))

vi.mock('../hooks/useCheckout', () => ({
    useCheckout: vi.fn(),
}))

vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

const mockedUseCartVariants = vi.mocked(useCartVariants)
const mockedUseCheckout = vi.mocked(useCheckout)

/**
 * Formats like the page does. jest-dom normalizes whitespace before comparing,
 * so the narrow no-break space Intl emits is normalized here too.
 */
function money(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {style: 'currency', currency: 'ZAR'})
        .format(amount)
        .replace(/\s/g, ' ')
}

function variant(overrides: Partial<CartVariant> & { id: string }): CartVariant {
    return {
        sku: 'SKU-1',
        status: 'ACTIVE',
        stockQuantity: 10,
        displayPrice: 199.99,
        images: [],
        ...overrides,
    }
}

function mockVariants(list: CartVariant[], unavailableIds: string[] = [], isLoading = false) {
    mockedUseCartVariants.mockReturnValue({
        variants: new Map(list.map((v) => [v.id, v])),
        unavailableIds,
        isLoading,
        isError: false,
    })
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderCartPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter>
                <CartPage/>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

describe('CartPage', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
        mockVariants([])
        mockedUseCheckout.mockReturnValue({
            checkout: vi.fn(),
            isLoading: false,
            unavailableVariantIds: [],
            error: null,
        })
    })

    describe('empty state', () => {
        it('renders "Your cart is empty" message and "Continue shopping" link to /products', () => {
            renderCartPage()

            expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
            const link = screen.getByRole('link', {name: /continue shopping/i})
            expect(link).toHaveAttribute('href', '/products')
        })

        it('reassures that the cart persists between visits', () => {
            renderCartPage()

            expect(screen.getByText(/saved on this device/i)).toBeInTheDocument()
        })

        it('does not render line item rows or checkout button when cart is empty', () => {
            renderCartPage()

            expect(screen.queryByText('Proceed to checkout')).not.toBeInTheDocument()
            expect(screen.queryByText('Estimated subtotal')).not.toBeInTheDocument()
        })

        it('uses the shared storefront page shell at the wide width', () => {
            const {container} = renderCartPage()

            // StorefrontLayout owns the <main> landmark, so the page shell is a div
            const shell = container.firstElementChild
            expect(shell?.tagName).toBe('DIV')
            expect(shell).toHaveClass('py-12', 'px-6', 'sm:px-8')
            expect(shell?.firstElementChild).toHaveClass('mx-auto', 'max-w-7xl')
        })
    })

    describe('line item display', () => {
        beforeEach(() => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                    {variantId: 'v2', productName: 'Denim Jeans', variantLabel: 'Blue / 32', quantity: 1},
                ],
                itemCount: 3,
            })

            mockVariants([
                variant({id: 'v1', sku: 'TEE-RED-M', displayPrice: 199.99}),
                variant({id: 'v2', sku: 'JEAN-32', displayPrice: 499.0}),
            ])
        })

        it('renders product names and variant labels', () => {
            renderCartPage()

            expect(screen.getByText('Classic Tee')).toBeInTheDocument()
            expect(screen.getByText('Red / M')).toBeInTheDocument()
            expect(screen.getByText('Denim Jeans')).toBeInTheDocument()
            expect(screen.getByText('Blue / 32')).toBeInTheDocument()
        })

        it('renders the SKU for each line so the shopper can verify it', () => {
            renderCartPage()

            expect(screen.getByText('SKU: TEE-RED-M')).toBeInTheDocument()
            expect(screen.getByText('SKU: JEAN-32')).toBeInTheDocument()
        })

        it('renders a thumbnail resolved through the shared image pipeline', () => {
            mockVariants([
                variant({
                    id: 'v1',
                    images: [{imageUrl: 'images/01/tee.png', featured: true, sortOrder: 0}],
                }),
                variant({id: 'v2'}),
            ])

            renderCartPage()

            const image = document.querySelector('img')
            expect(image).toHaveAttribute('src', '/static/images/images/01/tee.png')
        })

        it('renders the in-stock indicator when stock is known and positive', () => {
            renderCartPage()

            expect(screen.getAllByText('In stock')).toHaveLength(2)
        })

        it('renders unit price and line total per row', () => {
            renderCartPage()

            const rows = screen.getAllByTestId('cart-line-item')
            expect(within(rows[0]).getByTestId('cart-unit-price')).toHaveTextContent(money(199.99))
            // 2 × 199.99
            expect(within(rows[0]).getByTestId('cart-line-total')).toHaveTextContent(money(399.98))
            expect(within(rows[1]).getByTestId('cart-line-total')).toHaveTextContent(money(499))
        })

        it('renders the estimated subtotal as the sum of the orderable line totals', () => {
            renderCartPage()

            // 399.98 + 499.00
            expect(screen.getByTestId('cart-subtotal')).toHaveTextContent(money(898.98))
        })

        it('states that VAT and delivery are settled at checkout', () => {
            renderCartPage()

            expect(screen.getByText('Added at checkout')).toBeInTheDocument()
            expect(screen.getByText('Calculated at checkout')).toBeInTheDocument()
            expect(
                screen.getByText(/delivery and payment are confirmed on the next step/i)
            ).toBeInTheDocument()
        })

        it('renders the cart heading', () => {
            renderCartPage()

            expect(screen.getByText('Your Cart')).toBeInTheDocument()
        })

        it('uses the shared storefront page shell at the wide width', () => {
            const {container} = renderCartPage()

            const shell = container.firstElementChild
            expect(shell?.tagName).toBe('DIV')
            expect(shell).toHaveClass('py-12', 'px-6', 'sm:px-8')
            expect(shell?.firstElementChild).toHaveClass('mx-auto', 'max-w-7xl')
        })
    })

    describe('quantity stepper interaction', () => {
        beforeEach(() => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                ],
                itemCount: 2,
            })

            mockVariants([variant({id: 'v1'})])
        })

        it('calls updateQty with incremented quantity when increment is clicked', () => {
            renderCartPage()

            const incrementButton = screen.getByRole('button', {name: /increase quantity/i})
            fireEvent.click(incrementButton)

            const {items} = useCartStore.getState()
            expect(items[0].quantity).toBe(3)
        })

        it('calls updateQty with decremented quantity when decrement is clicked', () => {
            renderCartPage()

            const decrementButton = screen.getByRole('button', {name: /decrease quantity/i})
            fireEvent.click(decrementButton)

            const {items} = useCartStore.getState()
            expect(items[0].quantity).toBe(1)
        })

        it('updates the line total and the subtotal immediately after a quantity change', () => {
            renderCartPage()

            fireEvent.click(screen.getByRole('button', {name: /increase quantity/i}))

            // 3 × 199.99
            expect(screen.getByTestId('cart-line-total')).toHaveTextContent(money(199.99 * 3))
            expect(screen.getByTestId('cart-subtotal')).toHaveTextContent(money(199.99 * 3))
        })

        it('caps the stepper at the known stock level', () => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 3},
                ],
                itemCount: 3,
            })
            mockVariants([variant({id: 'v1', stockQuantity: 3})])

            renderCartPage()

            expect(screen.getByRole('button', {name: /increase quantity/i})).toBeDisabled()
        })

        it('leaves the stepper unbounded when stock is unknown', () => {
            mockVariants([variant({id: 'v1', stockQuantity: null})])

            renderCartPage()

            expect(screen.getByRole('button', {name: /increase quantity/i})).toBeEnabled()
        })
    })

    describe('remove button', () => {
        beforeEach(() => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                ],
                itemCount: 2,
            })

            mockVariants([variant({id: 'v1'})])
        })

        it('removes item from store when remove button is clicked', () => {
            renderCartPage()

            const removeButton = screen.getByRole('button', {name: /remove classic tee from cart/i})
            fireEvent.click(removeButton)

            const {items} = useCartStore.getState()
            expect(items).toHaveLength(0)
        })
    })

    describe('loading skeleton for price columns', () => {
        beforeEach(() => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                ],
                itemCount: 2,
            })

            mockVariants([], [], true)
        })

        it('renders skeleton placeholders when prices are loading', () => {
            const {container} = renderCartPage()

            const skeletons = container.querySelectorAll('.animate-pulse')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('still shows product name and variant label during loading', () => {
            renderCartPage()

            expect(screen.getByText('Classic Tee')).toBeInTheDocument()
            expect(screen.getByText('Red / M')).toBeInTheDocument()
        })

        it('does not accuse a still-loading line of having no price', () => {
            renderCartPage()

            expect(screen.queryByText(/price unavailable/i)).not.toBeInTheDocument()
        })
    })

    describe('blocked lines', () => {
        const twoItems = {
            items: [
                {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                {variantId: 'v2', productName: 'Vintage Jacket', variantLabel: 'Black / L', quantity: 1},
            ],
            itemCount: 3,
        }

        beforeEach(() => {
            useCartStore.setState(twoItems)
        })

        it('shows "No longer available" and blocks checkout when a variant is gone', () => {
            mockVariants([variant({id: 'v2', displayPrice: 899})], ['v1'])

            renderCartPage()

            expect(screen.getByText(/no longer available/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })

        it('treats a non-ACTIVE variant as unavailable', () => {
            mockVariants([variant({id: 'v1', status: 'DISABLED'}), variant({id: 'v2'})])

            renderCartPage()

            expect(screen.getByText(/no longer available/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })

        it('shows an out-of-stock message and blocks checkout when stock is zero', () => {
            mockVariants([variant({id: 'v1', stockQuantity: 0}), variant({id: 'v2'})])

            renderCartPage()

            expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })

        it('flags a quantity above the available stock, naming the number left', () => {
            mockVariants([variant({id: 'v1', stockQuantity: 1}), variant({id: 'v2'})])

            renderCartPage()

            expect(screen.getByText(/only 1 in stock/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })

        it('blocks checkout when a line has no price rather than ordering it at zero', () => {
            mockVariants([variant({id: 'v1', displayPrice: null}), variant({id: 'v2'})])

            renderCartPage()

            expect(screen.getByText(/price unavailable/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })

        it('excludes blocked lines from the estimated subtotal', () => {
            mockVariants([
                variant({id: 'v1', stockQuantity: 0, displayPrice: 199.99}),
                variant({id: 'v2', displayPrice: 499}),
            ])

            renderCartPage()

            expect(screen.getByTestId('cart-subtotal')).toHaveTextContent(money(499))
        })

        it('tells the shopper how many lines need fixing', () => {
            mockVariants([
                variant({id: 'v1', stockQuantity: 0}),
                variant({id: 'v2', status: 'DISABLED'}),
            ])

            renderCartPage()

            expect(screen.getByText(/fix the 2 flagged items above/i)).toBeInTheDocument()
        })

        it('reports a checkout rejection without claiming the item is gone', () => {
            mockVariants([variant({id: 'v1'}), variant({id: 'v2'})])
            mockedUseCheckout.mockReturnValue({
                checkout: vi.fn(),
                isLoading: false,
                unavailableVariantIds: ['v1'],
                error: null,
            })

            renderCartPage()

            expect(screen.getByText(/couldn't be confirmed at checkout/i)).toBeInTheDocument()
            expect(screen.queryByText(/no longer available/i)).not.toBeInTheDocument()
            expect(screen.getByRole('button', {name: /proceed to checkout/i})).toBeDisabled()
        })
    })

    describe('checkout', () => {
        beforeEach(() => {
            useCartStore.setState({
                items: [
                    {variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2},
                ],
                itemCount: 2,
            })
            mockVariants([variant({id: 'v1'})])
        })

        it('invokes checkout when nothing blocks it', () => {
            const checkout = vi.fn()
            mockedUseCheckout.mockReturnValue({
                checkout,
                isLoading: false,
                unavailableVariantIds: [],
                error: null,
            })

            renderCartPage()
            fireEvent.click(screen.getByRole('button', {name: /proceed to checkout/i}))

            expect(checkout).toHaveBeenCalledTimes(1)
        })

        it('surfaces a checkout error as an alert', () => {
            mockedUseCheckout.mockReturnValue({
                checkout: vi.fn(),
                isLoading: false,
                unavailableVariantIds: [],
                error: 'Something went wrong — please try again',
            })

            renderCartPage()

            expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
        })
    })
})
