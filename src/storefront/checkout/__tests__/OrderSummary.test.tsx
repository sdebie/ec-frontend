import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {OrderSummary} from '../components/OrderSummary'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {CheckoutSession} from '../types'
import {useCartVariants} from '@/storefront/cart/hooks/useCartVariants'

vi.mock('@/storefront/cart/hooks/useCartVariants', () => ({
    useCartVariants: vi.fn(),
}))

const mockedUseCartVariants = vi.mocked(useCartVariants)

const mockStorefrontConfig: StorefrontConfig = {
    clientId: 'test-client',
    clientName: 'Test Store',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [],
    sections: [],
    branding: {name: 'Test Store'},
}

const mockSession: CheckoutSession = {
    orderId: 'order-001',
    sessionId: 'session-001',
    lines: [
        {variantId: 'v1', name: 'Blue Widget', unitPrice: 150, quantity: 2, lineTotal: 300},
        {variantId: 'v2', name: 'Red Gadget', unitPrice: 75.5, quantity: 1, lineTotal: 75.5},
        {variantId: 'v3', name: 'Green Thingamajig', unitPrice: 220, quantity: 3, lineTotal: 660},
    ],
    subtotal: 1035.5,
    vatAmount: 155.33,
    shippingEstimate: 89,
    grandTotal: 1279.83,
}

function renderOrderSummary(
    {config = mockStorefrontConfig, selectedShippingFee = 89 as number | null} = {},
) {
    return render(
        <MemoryRouter>
            <StorefrontConfigContext.Provider value={config}>
                <OrderSummary selectedShippingFee={selectedShippingFee}/>
            </StorefrontConfigContext.Provider>
        </MemoryRouter>
    )
}

// jest-dom / testing-library normalize whitespace, so the narrow no-break space
// Intl emits has to be normalized here too.
const money = (amount: number, currency = 'ZAR', locale = 'en-ZA') =>
    formatAmount(amount, currency, locale).replace(/\s/g, ' ')

describe('OrderSummary', () => {
    beforeEach(() => {
        useCheckoutSessionStore.setState({session: null})
        mockedUseCartVariants.mockReturnValue({
            variants: new Map(),
            unavailableIds: [],
            isLoading: false,
            isError: false,
        })
    })

    it('renders nothing when session is null', () => {
        const {container} = renderOrderSummary()
        expect(container.firstChild).toBeNull()
    })

    it('renders all line items with name, quantity, formatted unitPrice, and formatted lineTotal', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary()

        const lines = screen.getAllByTestId('order-summary-line')
        expect(lines).toHaveLength(mockSession.lines.length)

        mockSession.lines.forEach((line, i) => {
            const row = lines[i]
            expect(within(row).getByText(line.name)).toBeInTheDocument()
            expect(
                within(row).getByText(`${line.quantity} × ${money(line.unitPrice)}`)
            ).toBeInTheDocument()
            expect(within(row).getByText(money(line.lineTotal))).toBeInTheDocument()
        })
    })

    it('hydrates each line with its SKU and thumbnail for display only', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        mockedUseCartVariants.mockReturnValue({
            variants: new Map([
                ['v1', {
                    id: 'v1',
                    sku: 'WIDGET-BLUE',
                    status: 'ACTIVE',
                    stockQuantity: 5,
                    // A price the order does NOT use — the line price must win.
                    displayPrice: 999,
                    images: [{imageUrl: 'images/01/widget.png', featured: true, sortOrder: 0}],
                }],
            ]),
            unavailableIds: [],
            isLoading: false,
            isError: false,
        })

        renderOrderSummary()

        const firstLine = screen.getAllByTestId('order-summary-line')[0]
        expect(within(firstLine).getByText('SKU: WIDGET-BLUE')).toBeInTheDocument()
        expect(firstLine.querySelector('img'))
            .toHaveAttribute('src', '/static/images/images/01/widget.png')
        // The catalogue price never displaces the price the order was placed at
        expect(within(firstLine).getByText(`2 × ${money(150)}`)).toBeInTheDocument()
        expect(within(firstLine).queryByText(money(999))).not.toBeInTheDocument()
    })

    it('shows the order subtotal and VAT from the session', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary()

        expect(screen.getByTestId('summary-subtotal')).toHaveTextContent(money(1035.5))
        expect(screen.getByTestId('summary-vat')).toHaveTextContent(money(155.33))
    })

    it('shows the selected delivery fee and a total that adds it to subtotal and VAT', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary({selectedShippingFee: 115})

        // Matches OrderService.computeTotals: VAT is charged on the subtotal only
        expect(screen.getByTestId('summary-delivery')).toHaveTextContent(money(115))
        expect(screen.getByTestId('summary-total')).toHaveTextContent(money(1035.5 + 155.33 + 115))
    })

    it('does not invent a total before a delivery method is chosen', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary({selectedShippingFee: null})

        expect(screen.getByTestId('summary-delivery')).toHaveTextContent('Choose a method')
        expect(screen.getByTestId('summary-total')).toHaveTextContent('—')
    })

    it('treats a free delivery method as a real choice, not a missing one', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary({selectedShippingFee: 0})

        expect(screen.getByTestId('summary-delivery')).toHaveTextContent(money(0))
        expect(screen.getByTestId('summary-total')).toHaveTextContent(money(1035.5 + 155.33))
    })

    it('uses currency and locale from storefront config', () => {
        const usdConfig: StorefrontConfig = {
            ...mockStorefrontConfig,
            currency: 'USD',
            locale: 'en-US',
        }

        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary({config: usdConfig, selectedShippingFee: 89})

        expect(screen.getByTestId('summary-total')).toHaveTextContent(
            money(1035.5 + 155.33 + 89, 'USD', 'en-US')
        )
    })

    it('renders the "Order summary" heading', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary()

        expect(screen.getByRole('heading', {name: /order summary/i})).toBeInTheDocument()
    })

    it('renders all line items in a list', () => {
        useCheckoutSessionStore.setState({session: mockSession})
        renderOrderSummary()

        expect(screen.getByRole('list')).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(mockSession.lines.length)
    })
})
