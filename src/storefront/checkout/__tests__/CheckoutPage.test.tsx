import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'
import { useCheckoutSessionStore } from '../checkoutSessionStore'
import type { CheckoutSession } from '../types'

// --- Mocks ---

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('orderId=order-123')],
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

vi.mock('../hooks/useShippingMethods', () => ({
  useShippingMethods: () => ({
    data: [
      { id: 'sm-collection-01', name: 'In-store Collection', baseFee: 0, estimatedDays: null },
      { id: 'sm-delivery-01', name: 'Standard Delivery', baseFee: 89, estimatedDays: '3-5' },
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
    { getState: () => ({ isSignedIn: false, email: null, firstName: null, lastName: null }) }
  ),
}))

// --- Helpers ---

const mockSession: CheckoutSession = {
  orderId: 'order-123',
  sessionId: 'session-abc',
  lines: [
    { variantId: 'v1', name: 'Widget', unitPrice: 100, quantity: 2, lineTotal: 200 },
  ],
  subtotal: 200,
  vatAmount: 30,
  shippingEstimate: 89,
  grandTotal: 319,
}

const mockStorefrontConfig: StorefrontConfig = {
  clientId: 'test-client',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
  branding: { name: 'Test Store' },
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
        <MemoryRouter initialEntries={['/checkout?orderId=order-123']}>
          <CheckoutPage />
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
    useCheckoutSessionStore.setState({ session: null })
    CheckoutPage = await importCheckoutPage()
  })

  describe('session fallback', () => {
    it('renders expired-session fallback when no session exists', () => {
      useCheckoutSessionStore.setState({ session: null })
      renderCheckoutPage(CheckoutPage)

      expect(
        screen.getByText(/your checkout session has expired/i)
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /return to cart/i })).toHaveAttribute(
        'href',
        '/cart'
      )
    })

    it('renders the checkout form when session is present', () => {
      useCheckoutSessionStore.setState({ session: mockSession })
      renderCheckoutPage(CheckoutPage)

      expect(screen.getByText('Checkout')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument()
      expect(
        screen.queryByText(/your checkout session has expired/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('PATCH failure blocks payment', () => {
    it('shows inline error and never calls payment when PATCH fails', async () => {
      const user = userEvent.setup()
      useCheckoutSessionStore.setState({ session: mockSession })
      mockSubmitContactMutateAsync.mockRejectedValueOnce(new Error('Server error'))

      renderCheckoutPage(CheckoutPage)

      // Fill in required form fields
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')

      // Select collection shipping (no address required)
      const collectionRadio = screen.getByRole('radio', { name: /in-store collection/i })
      await user.click(collectionRadio)

      // Select PayFast payment
      const payfastRadio = screen.getByRole('radio', { name: /pay online/i })
      await user.click(payfastRadio)

      // Submit the form
      await user.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/could not save contact details/i)
        ).toBeInTheDocument()
      })

      expect(mockInitiatePaymentMutateAsync).not.toHaveBeenCalled()
    })
  })

  describe('PayFast flow', () => {
    it('calls submitPayFastForm with gatewayUrl and fields on success', async () => {
      const user = userEvent.setup()
      useCheckoutSessionStore.setState({ session: mockSession })

      mockSubmitContactMutateAsync.mockResolvedValueOnce({ orderId: 'order-123' })
      mockInitiatePaymentMutateAsync.mockResolvedValueOnce({
        gatewayUrl: 'https://sandbox.payfast.co.za/eng/process',
        fields: [
          { name: 'merchant_id', value: '10000100' },
          { name: 'amount', value: '319.00' },
        ],
      })

      renderCheckoutPage(CheckoutPage)

      // Fill in required form fields
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')

      // Select collection shipping (no address required)
      const collectionRadio = screen.getByRole('radio', { name: /in-store collection/i })
      await user.click(collectionRadio)

      // Select PayFast payment
      const payfastRadio = screen.getByRole('radio', { name: /pay online/i })
      await user.click(payfastRadio)

      // Submit the form
      await user.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(mockSubmitPayFastForm).toHaveBeenCalledWith(
          'https://sandbox.payfast.co.za/eng/process',
          [
            { name: 'merchant_id', value: '10000100' },
            { name: 'amount', value: '319.00' },
          ]
        )
      })
    })
  })

  describe('In-store flow', () => {
    it('navigates to success page with sessionId after PATCH succeeds', async () => {
      const user = userEvent.setup()
      useCheckoutSessionStore.setState({ session: mockSession })

      mockSubmitContactMutateAsync.mockResolvedValueOnce({ orderId: 'order-123' })

      renderCheckoutPage(CheckoutPage)

      // Fill in required form fields
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
      await user.type(screen.getByLabelText(/first name/i), 'Jane')
      await user.type(screen.getByLabelText(/last name/i), 'Doe')

      // Select collection shipping (no address required)
      const collectionRadio = screen.getByRole('radio', { name: /in-store collection/i })
      await user.click(collectionRadio)

      // Select in-store payment
      const instoreRadio = screen.getByRole('radio', { name: /pay in store/i })
      await user.click(instoreRadio)

      // Submit the form
      await user.click(screen.getByRole('button', { name: /place order/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/checkout/success?sessionId=session-abc'
        )
      })

      expect(mockInitiatePaymentMutateAsync).not.toHaveBeenCalled()
    })
  })
})
