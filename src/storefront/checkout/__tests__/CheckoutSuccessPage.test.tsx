import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

// --- Mocks ---

const mockClearSession = vi.fn()
vi.mock('../checkoutSessionStore', () => ({
  useCheckoutSessionStore: (selector: (state: { clearSession: () => void }) => unknown) =>
    selector({ clearSession: mockClearSession }),
}))

const mockClearCart = vi.fn()
vi.mock('@/storefront/cart/cartStore', () => ({
  useCartStore: (selector: (state: { clearCart: () => void }) => unknown) =>
    selector({ clearCart: mockClearCart }),
}))

let mockSearchParams = new URLSearchParams()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams],
  }
})

let mockPollResult: {
  data: { id: string; status: string; totalAmount: number; createdAt: string } | undefined
  isTerminal: boolean
  isTimedOut: boolean
} = { data: undefined, isTerminal: false, isTimedOut: false }

vi.mock('../hooks/usePollOrderStatus', () => ({
  usePollOrderStatus: () => mockPollResult,
}))

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
  branding: { name: 'Test Store' },
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
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
          <Component />
        </MemoryRouter>
      </StorefrontConfigContext.Provider>
    </QueryClientProvider>
  )
}

// --- Tests ---

describe('CheckoutSuccessPage', () => {
  let CheckoutSuccessPage: React.ComponentType

  beforeEach(async () => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockPollResult = { data: undefined, isTerminal: false, isTimedOut: false }
    CheckoutSuccessPage = await importCheckoutSuccessPage()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('missing sessionId', () => {
    it('renders invalid link fallback when sessionId param is absent', () => {
      mockSearchParams = new URLSearchParams()
      renderCheckoutSuccessPage(CheckoutSuccessPage)

      expect(screen.getByText(/invalid confirmation link/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /return to home/i })).toHaveAttribute(
        'href',
        '/'
      )
    })
  })

  describe('PAID status', () => {
    it('shows payment confirmed message with orderId and total, clearSession called', () => {
      mockSearchParams = new URLSearchParams('sessionId=session-abc')
      mockPollResult = {
        data: { id: 'order-456', status: 'PAID', totalAmount: 319, createdAt: '2024-01-01' },
        isTerminal: true,
        isTimedOut: false,
      }

      renderCheckoutSuccessPage(CheckoutSuccessPage)

      expect(screen.getByText('Payment confirmed')).toBeInTheDocument()
      expect(screen.getByText('order-456')).toBeInTheDocument()
      expect(screen.getByText(/ZAR 319\.00/)).toBeInTheDocument()
      expect(mockClearSession).toHaveBeenCalled()
    })
  })

  describe('IN_STORE_PAYMENT status', () => {
    it('shows collection message when status is IN_STORE_PAYMENT', () => {
      mockSearchParams = new URLSearchParams('sessionId=session-abc')
      mockPollResult = {
        data: { id: 'order-789', status: 'IN_STORE_PAYMENT', totalAmount: 200, createdAt: '2024-01-01' },
        isTerminal: true,
        isTimedOut: false,
      }

      renderCheckoutSuccessPage(CheckoutSuccessPage)

      expect(screen.getByText(/your order is confirmed\. please pay at collection\./i)).toBeInTheDocument()
      expect(mockClearSession).toHaveBeenCalled()
    })
  })

  describe('timeout', () => {
    it('shows timeout message when isTimedOut is true', () => {
      mockSearchParams = new URLSearchParams('sessionId=session-abc')
      mockPollResult = {
        data: undefined,
        isTerminal: false,
        isTimedOut: true,
      }

      renderCheckoutSuccessPage(CheckoutSuccessPage)

      expect(
        screen.getByText(/payment is taking longer than expected/i)
      ).toBeInTheDocument()
    })
  })
})
