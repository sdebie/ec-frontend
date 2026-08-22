import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig} from '@/shared/types/StorefrontConfig'

// --- Mocks ---

interface MockSessionState {
    session: { orderId: string; orderToken: string } | null
    clearCheckoutIntent: () => void
}

const mockClearCheckoutIntent = vi.fn()
let mockSessionState: MockSessionState = {session: null, clearCheckoutIntent: mockClearCheckoutIntent}

vi.mock('../store/checkoutSessionStore', () => ({
    useCheckoutSessionStore: (selector: (state: MockSessionState) => unknown) => selector(mockSessionState),
}))

const mockClearCart = vi.fn()
vi.mock('@/storefront/cart/store/cartStore', () => ({
    useCartStore: (selector: (state: { clear: () => void }) => unknown) =>
        selector({clear: mockClearCart}),
}))

let mockPollResult: {
    data: { id: string; status: string; totalAmount: number; createdAt: string } | undefined
    isTerminal: boolean
    isTimedOut: boolean
} = {data: undefined, isTerminal: false, isTimedOut: false}

vi.mock('../hooks/usePollOrderStatus', async () => {
    const actual = await vi.importActual<typeof import('../hooks/usePollOrderStatus')>('../hooks/usePollOrderStatus')
    return {
        ...actual,
        usePollOrderStatus: () => mockPollResult,
    }
})

vi.mock('@/shared/utils/formatAmount', () => ({
    formatAmount: (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`,
}))

// --- Helpers ---

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
        defaultOptions: {queries: {retry: false}},
    })
}

async function importCheckoutSuccessPage() {
    const mod = await import('../CheckoutSuccessPage')
    return mod.CheckoutSuccessPage
}

function renderCheckoutSuccessPage(Component: React.ComponentType) {
    const queryClient = createQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <StorefrontConfigContext.Provider value={mockStorefrontConfig}>
                <MemoryRouter>
                    <Component/>
                </MemoryRouter>
            </StorefrontConfigContext.Provider>
        </QueryClientProvider>
    )
}

// --- Tests ---

/**
 * guest-order-authorization: this page now reads orderId/orderToken from
 * checkoutSessionStore, never a URL query string (Requirement 3.5) — the withdrawn
 * ?sessionId= was itself a bearer credential (Requirement 4).
 */
describe('CheckoutSuccessPage', () => {
    let CheckoutSuccessPage: React.ComponentType

    beforeEach(async () => {
        vi.clearAllMocks()
        mockSessionState = {session: null, clearCheckoutIntent: mockClearCheckoutIntent}
        mockPollResult = {data: undefined, isTerminal: false, isTimedOut: false}
        CheckoutSuccessPage = await importCheckoutSuccessPage()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('missing session', () => {
        it('renders invalid link fallback when there is no order in the store', () => {
            mockSessionState = {session: null, clearCheckoutIntent: mockClearCheckoutIntent}
            renderCheckoutSuccessPage(CheckoutSuccessPage)

            expect(screen.getByText(/this link isn't valid/i)).toBeInTheDocument()
            expect(screen.getByRole('link', {name: /return to home/i})).toHaveAttribute(
                'href',
                '/'
            )
        })
    })

    describe('PAID status', () => {
        it('shows payment confirmed message with orderId and total, clearCheckoutIntent called', () => {
            mockSessionState = {
                session: {orderId: 'order-456', orderToken: 'token-456'},
                clearCheckoutIntent: mockClearCheckoutIntent,
            }
            mockPollResult = {
                data: {id: 'order-456', status: 'PAID', totalAmount: 319, createdAt: '2024-01-01'},
                isTerminal: true,
                isTimedOut: false,
            }

            renderCheckoutSuccessPage(CheckoutSuccessPage)

            expect(screen.getByText('Payment confirmed')).toBeInTheDocument()
            // Order id and total are stated in the confirmation sentence
            expect(screen.getByText(/order-456/)).toBeInTheDocument()
            expect(screen.getByText(/ZAR 319\.00/)).toBeInTheDocument()
            expect(mockClearCheckoutIntent).toHaveBeenCalled()
        })
    })

    describe('IN_STORE_PAYMENT status', () => {
        it('shows collection message when status is IN_STORE_PAYMENT', () => {
            mockSessionState = {
                session: {orderId: 'order-789', orderToken: 'token-789'},
                clearCheckoutIntent: mockClearCheckoutIntent,
            }
            mockPollResult = {
                data: {id: 'order-789', status: 'IN_STORE_PAYMENT', totalAmount: 200, createdAt: '2024-01-01'},
                isTerminal: true,
                isTimedOut: false,
            }

            renderCheckoutSuccessPage(CheckoutSuccessPage)

            expect(screen.getByText(/your order is confirmed\. please pay when you collect it\./i)).toBeInTheDocument()
            expect(mockClearCheckoutIntent).toHaveBeenCalled()
        })
    })

    describe('PAYMENT_FAILED status', () => {
        it('shows a payment-failed message, distinct from cancelled, and stops on it rather than the confirming spinner', () => {
            mockSessionState = {
                session: {orderId: 'order-321', orderToken: 'token-321'},
                clearCheckoutIntent: mockClearCheckoutIntent,
            }
            mockPollResult = {
                data: {id: 'order-321', status: 'PAYMENT_FAILED', totalAmount: 150, createdAt: '2024-01-01'},
                isTerminal: true,
                isTimedOut: false,
            }

            renderCheckoutSuccessPage(CheckoutSuccessPage)

            expect(screen.getByText('Payment failed')).toBeInTheDocument()
            expect(screen.queryByText(/this order was cancelled/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/confirming your payment/i)).not.toBeInTheDocument()
            expect(mockClearCheckoutIntent).toHaveBeenCalled()
        })
    })

    describe('cancelled status', () => {
        it.each(['USER_CANCELED', 'ADMIN_CANCELED', 'SYSTEM_CANCELED', 'FAILED'])(
            'shows a cancelled message for %s rather than hanging on "Confirming your payment…"',
            (status) => {
                mockSessionState = {
                    session: {orderId: 'order-999', orderToken: 'token-999'},
                    clearCheckoutIntent: mockClearCheckoutIntent,
                }
                mockPollResult = {
                    data: {id: 'order-999', status, totalAmount: 100, createdAt: '2024-01-01'},
                    isTerminal: false,
                    isTimedOut: false,
                }

                renderCheckoutSuccessPage(CheckoutSuccessPage)

                expect(screen.getByText(/this order was cancelled/i)).toBeInTheDocument()
            }
        )
    })

    describe('timeout', () => {
        it('shows timeout message when isTimedOut is true', () => {
            mockSessionState = {
                session: {orderId: 'order-abc', orderToken: 'token-abc'},
                clearCheckoutIntent: mockClearCheckoutIntent,
            }
            mockPollResult = {
                data: undefined,
                isTerminal: false,
                isTimedOut: true,
            }

            renderCheckoutSuccessPage(CheckoutSuccessPage)

            expect(
                screen.getByText(/taking longer than usual/i)
            ).toBeInTheDocument()
        })
    })
})
