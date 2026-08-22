import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import type {CheckoutSession} from '../types'

// --- Mocks ---

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const mockSubmitContactMutateAsync = vi.fn()
vi.mock('../hooks/useSubmitContact', () => ({
    useSubmitContact: () => ({
        mutateAsync: mockSubmitContactMutateAsync,
    }),
}))

const mockInitiatePaymentMutateAsync = vi.fn()
vi.mock('../hooks/useInitiatePayment', () => ({
    useInitiatePayment: () => ({
        mutateAsync: mockInitiatePaymentMutateAsync,
    }),
}))

const mockConfirmInStorePaymentMutateAsync = vi.fn()
vi.mock('../hooks/useConfirmInStorePayment', () => ({
    useConfirmInStorePayment: () => ({
        mutateAsync: mockConfirmInStorePaymentMutateAsync,
    }),
}))

vi.mock('../hooks/useShippingMethods', () => ({
    useShippingMethods: () => ({
        data: [
            {
                id: 'sm-collection-01',
                name: 'In-store Collection',
                baseFee: 0,
                estimatedDays: null,
                requiresAddress: false,
            },
            {
                id: 'sm-delivery-01',
                name: 'Standard Delivery',
                baseFee: 89,
                estimatedDays: '3-5',
                requiresAddress: true,
            },
        ],
        isLoading: false,
        isError: false,
    }),
}))

vi.mock('../hooks/usePaymentMethods', () => ({
    usePaymentMethods: () => ({
        data: ['PAYFAST', 'IN_STORE'],
        isLoading: false,
        isError: false,
    }),
}))

const mockSubmitPayFastForm = vi.fn()
vi.mock('../utils/submitPayFastForm', () => ({
    submitPayFastForm: (...args: unknown[]) => mockSubmitPayFastForm(...args),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: Object.assign(
        () => ({
            isSignedIn: false,
            email: null,
            firstName: null,
            lastName: null,
        }),
        {getState: () => ({isSignedIn: false, email: null, firstName: null, lastName: null})}
    ),
}))

// --- Helpers ---

const mockSession: CheckoutSession = {
    orderId: 'order-123',
    sessionId: 'session-abc',
    lines: [
        {variantId: 'v1', name: 'Widget', unitPrice: 100, quantity: 2, lineTotal: 200},
    ],
    subtotal: 200,
    vatAmount: 30,
    shippingEstimate: 89,
    grandTotal: 319,
    orderToken: 'token-abc',
}

// Matches mockSession.lines — CheckoutPage now refuses to render a session the
// live cart has diverged from, so every test exercising the form must seed a
// cart that still agrees with it.
const mockCartItems = [
    {variantId: 'v1', productName: 'Widget', variantLabel: '', quantity: 2},
]

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

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    })
}

// Use dynamic import to load after mocks
async function importCheckoutPage() {
    const mod = await import('../CheckoutPage')
    return mod.CheckoutPage
}

function renderCheckoutPage(CheckoutPage: React.ComponentType) {
    const queryClient = createQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <StorefrontConfigContext.Provider value={mockStorefrontConfig}>
                <MemoryRouter initialEntries={['/checkout']}>
                    <CheckoutPage/>
                </MemoryRouter>
            </StorefrontConfigContext.Provider>
        </QueryClientProvider>
    )
}

// --- Tests ---

describe('CheckoutPage', () => {
    let CheckoutPage: React.ComponentType

    beforeEach(async () => {
        vi.clearAllMocks()
        useCheckoutSessionStore.setState({session: null, idempotencyKey: null, idempotencyKeyCartSignature: null})
        useCartStore.setState({items: mockCartItems, itemCount: 2})
        CheckoutPage = await importCheckoutPage()
    })

    describe('session fallback', () => {
        it('renders expired-session fallback when no session exists', () => {
            useCheckoutSessionStore.setState({session: null})
            renderCheckoutPage(CheckoutPage)

            expect(
                screen.getByText(/your checkout session has expired/i)
            ).toBeInTheDocument()
            expect(screen.getByRole('link', {name: /return to cart/i})).toHaveAttribute(
                'href',
                '/cart'
            )
        })

        it('renders the checkout form when session is present', () => {
            useCheckoutSessionStore.setState({session: mockSession})
            renderCheckoutPage(CheckoutPage)

            expect(screen.getByText('Checkout')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /place order/i})).toBeInTheDocument()
            expect(
                screen.queryByText(/your checkout session has expired/i)
            ).not.toBeInTheDocument()
        })

        it('offers a way back to the cart to change the order', () => {
            useCheckoutSessionStore.setState({session: mockSession})
            renderCheckoutPage(CheckoutPage)

            // Two routes back by design: the toolbar's navigational one, and the
            // contextual "Edit" beside the items in the summary.
            const backLinks = screen.getAllByRole('link', {name: /back to cart|^edit$/i})
            expect(backLinks.length).toBeGreaterThanOrEqual(2)
            backLinks.forEach((link) => expect(link).toHaveAttribute('href', '/cart'))
        })

        it('states how many items the order covers, above the divider', () => {
            useCheckoutSessionStore.setState({session: mockSession})
            const {container} = renderCheckoutPage(CheckoutPage)

            const toolbar = container.querySelector('.border-b')
            expect(toolbar).toBeTruthy()
            expect(toolbar).toHaveTextContent(/items? in this order/i)
        })
    })

    describe('cart divergence', () => {
        it('renders expired-session fallback when the live cart no longer matches what the session was priced for', () => {
            useCheckoutSessionStore.setState({session: mockSession})
            useCartStore.setState({
                items: [{variantId: 'v1', productName: 'Widget', variantLabel: '', quantity: 3}],
                itemCount: 3,
            })

            renderCheckoutPage(CheckoutPage)

            expect(screen.getByText(/your checkout session has expired/i)).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: /place order/i})).not.toBeInTheDocument()
        })

        it('clears the stale session rather than leaving it to be coincidentally revived by a later matching cart', async () => {
            useCheckoutSessionStore.setState({
                session: mockSession,
                idempotencyKey: 'key-1',
                idempotencyKeyCartSignature: 'sig-1',
            })
            useCartStore.setState({
                items: [{variantId: 'v1', productName: 'Widget', variantLabel: '', quantity: 3}],
                itemCount: 3,
            })

            renderCheckoutPage(CheckoutPage)

            await waitFor(() => {
                expect(useCheckoutSessionStore.getState().session).toBeNull()
            })
            expect(useCheckoutSessionStore.getState().idempotencyKey).toBeNull()
        })
    })

    describe('PATCH failure blocks payment', () => {
        it('shows inline error and never calls payment when PATCH fails', async () => {
            const user = userEvent.setup()
            useCheckoutSessionStore.setState({session: mockSession})
            mockSubmitContactMutateAsync.mockRejectedValueOnce(new Error('Server error'))

            renderCheckoutPage(CheckoutPage)

            // Fill in required form fields
            await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
            await user.type(screen.getByLabelText(/first name/i), 'Jane')
            await user.type(screen.getByLabelText(/last name/i), 'Doe')

            // Select collection shipping (no address required)
            const collectionRadio = screen.getByRole('radio', {name: /in-store collection/i})
            await user.click(collectionRadio)

            // Select PayFast payment
            const payfastRadio = screen.getByRole('radio', {name: /pay online/i})
            await user.click(payfastRadio)

            // Submit the form
            await user.click(screen.getByRole('button', {name: /place order/i}))

            await waitFor(() => {
                expect(
                    screen.getByText(/could not save your details/i)
                ).toBeInTheDocument()
            })

            expect(mockInitiatePaymentMutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('PayFast flow', () => {
        it('calls submitPayFastForm with gatewayUrl and fields on success', async () => {
            const user = userEvent.setup()
            useCheckoutSessionStore.setState({session: mockSession})

            mockSubmitContactMutateAsync.mockResolvedValueOnce({orderId: 'order-123'})
            mockInitiatePaymentMutateAsync.mockResolvedValueOnce({
                gatewayUrl: 'https://sandbox.payfast.co.za/eng/process',
                fields: [
                    {name: 'merchant_id', value: '10000100'},
                    {name: 'amount', value: '319.00'},
                ],
            })

            renderCheckoutPage(CheckoutPage)

            // Fill in required form fields
            await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
            await user.type(screen.getByLabelText(/first name/i), 'Jane')
            await user.type(screen.getByLabelText(/last name/i), 'Doe')

            // Select collection shipping (no address required)
            const collectionRadio = screen.getByRole('radio', {name: /in-store collection/i})
            await user.click(collectionRadio)

            // Select PayFast payment
            const payfastRadio = screen.getByRole('radio', {name: /pay online/i})
            await user.click(payfastRadio)

            // Submit the form
            await user.click(screen.getByRole('button', {name: /place order/i}))

            await waitFor(() => {
                expect(mockSubmitPayFastForm).toHaveBeenCalledWith(
                    'https://sandbox.payfast.co.za/eng/process',
                    [
                        {name: 'merchant_id', value: '10000100'},
                        {name: 'amount', value: '319.00'},
                    ]
                )
            })
        })
    })

    describe('In-store flow', () => {
        async function fillInStoreCheckout(user: ReturnType<typeof userEvent.setup>) {
            await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
            await user.type(screen.getByLabelText(/first name/i), 'Jane')
            await user.type(screen.getByLabelText(/last name/i), 'Doe')

            await user.click(screen.getByRole('radio', {name: /in-store collection/i}))
            await user.click(screen.getByRole('radio', {name: /pay in store/i}))
            await user.click(screen.getByRole('button', {name: /place order/i}))
        }

        it('confirms the order server-side before navigating to the success page', async () => {
            const user = userEvent.setup()
            useCheckoutSessionStore.setState({session: mockSession})

            mockSubmitContactMutateAsync.mockResolvedValueOnce({orderId: 'order-123'})
            mockConfirmInStorePaymentMutateAsync.mockResolvedValueOnce({
                orderId: 'order-123',
                status: 'IN_STORE_PAYMENT',
            })

            renderCheckoutPage(CheckoutPage)
            await fillInStoreCheckout(user)

            await waitFor(() => {
                // No identifier in the URL (Requirement 3.5) — the success page reads
                // the order from checkoutSessionStore.
                expect(mockNavigate).toHaveBeenCalledWith('/checkout/success')
            })

            expect(mockConfirmInStorePaymentMutateAsync).toHaveBeenCalledWith({
                orderId: 'order-123',
                token: 'token-abc',
            })
            expect(mockInitiatePaymentMutateAsync).not.toHaveBeenCalled()
        })

        /**
         * The order would otherwise sit at CREATED, where the stock-recovery sweep
         * cancels it as an abandoned cart — so a shopper sent to the success page
         * without this call has been told their order was placed when it is about
         * to be cancelled.
         */
        it('does not navigate when the confirmation fails, and says so', async () => {
            const user = userEvent.setup()
            useCheckoutSessionStore.setState({session: mockSession})

            mockSubmitContactMutateAsync.mockResolvedValueOnce({orderId: 'order-123'})
            mockConfirmInStorePaymentMutateAsync.mockRejectedValueOnce(new Error('boom'))

            renderCheckoutPage(CheckoutPage)
            await fillInStoreCheckout(user)

            await waitFor(() => {
                expect(screen.getByText(/could not place your order/i)).toBeInTheDocument()
            })

            expect(mockNavigate).not.toHaveBeenCalled()
        })

        /**
         * Nobody is at the counter to take money for an order being couriered, and
         * the server rejects the combination — so it must never be offered.
         */
        it('withdraws the pay-in-store option when a delivery method is chosen', async () => {
            const user = userEvent.setup()
            useCheckoutSessionStore.setState({session: mockSession})

            renderCheckoutPage(CheckoutPage)

            await user.click(screen.getByRole('radio', {name: /in-store collection/i}))
            expect(screen.getByRole('radio', {name: /pay in store/i})).toBeInTheDocument()

            await user.click(screen.getByRole('radio', {name: /standard delivery/i}))

            await waitFor(() => {
                expect(screen.queryByRole('radio', {name: /pay in store/i})).toBeNull()
            })
        })
    })
})
