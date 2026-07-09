import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'
import { useCheckoutSessionStore } from '../checkoutSessionStore'
import { OrderSummary } from '../components/OrderSummary'
import { formatAmount } from '@/shared/utils/formatAmount'
import type { CheckoutSession } from '../types'

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

const mockSession: CheckoutSession = {
  orderId: 'order-001',
  sessionId: 'session-001',
  lines: [
    { variantId: 'v1', name: 'Blue Widget', unitPrice: 150, quantity: 2, lineTotal: 300 },
    { variantId: 'v2', name: 'Red Gadget', unitPrice: 75.5, quantity: 1, lineTotal: 75.5 },
    { variantId: 'v3', name: 'Green Thingamajig', unitPrice: 220, quantity: 3, lineTotal: 660 },
  ],
  subtotal: 1035.5,
  vatAmount: 155.33,
  shippingEstimate: 89,
  grandTotal: 1279.83,
}

function renderOrderSummary(config = mockStorefrontConfig) {
  return render(
    <StorefrontConfigContext.Provider value={config}>
      <OrderSummary />
    </StorefrontConfigContext.Provider>
  )
}

// --- Tests ---

describe('OrderSummary', () => {
  beforeEach(() => {
    useCheckoutSessionStore.setState({ session: null })
  })

  it('renders nothing when session is null', () => {
    const { container } = renderOrderSummary()
    expect(container.firstChild).toBeNull()
  })

  it('renders all line items with name, quantity, formatted unitPrice, and formatted lineTotal', () => {
    useCheckoutSessionStore.setState({ session: mockSession })
    renderOrderSummary()

    for (const line of mockSession.lines) {
      expect(screen.getByText(line.name)).toBeInTheDocument()

      const expectedUnitPrice = formatAmount(line.unitPrice, 'ZAR', 'en-ZA')
      const expectedLineTotal = formatAmount(line.lineTotal, 'ZAR', 'en-ZA')

      // quantity × unitPrice — text is split across child nodes within a <p>
      expect(
        screen.getByText((_, element) => {
          if (element?.tagName !== 'P') return false
          return element.textContent === `${line.quantity} × ${expectedUnitPrice}`
        })
      ).toBeInTheDocument()

      // lineTotal rendered in its own <p> element
      expect(
        screen.getByText((_, element) => {
          if (element?.tagName !== 'P') return false
          return element.textContent === expectedLineTotal
        })
      ).toBeInTheDocument()
    }
  })

  it('renders subtotal, VAT, shipping, and grand total formatted amounts', () => {
    useCheckoutSessionStore.setState({ session: mockSession })
    renderOrderSummary()

    const expectedSubtotal = formatAmount(mockSession.subtotal, 'ZAR', 'en-ZA')
    const expectedVat = formatAmount(mockSession.vatAmount, 'ZAR', 'en-ZA')
    const expectedShipping = formatAmount(mockSession.shippingEstimate, 'ZAR', 'en-ZA')
    const expectedGrandTotal = formatAmount(mockSession.grandTotal, 'ZAR', 'en-ZA')

    // Target <dd> elements to avoid matching parent containers
    const findInDd = (text: string) => (_: string, element: Element | null) =>
      element?.tagName === 'DD' && element.textContent === text

    expect(screen.getByText(findInDd(expectedSubtotal))).toBeInTheDocument()
    expect(screen.getByText(findInDd(expectedVat))).toBeInTheDocument()
    expect(screen.getByText(findInDd(expectedShipping))).toBeInTheDocument()
    expect(screen.getByText(findInDd(expectedGrandTotal))).toBeInTheDocument()
  })

  it('uses currency and locale from storefront config', () => {
    const usdConfig: StorefrontConfig = {
      ...mockStorefrontConfig,
      currency: 'USD',
      locale: 'en-US',
    }

    useCheckoutSessionStore.setState({ session: mockSession })
    renderOrderSummary(usdConfig)

    const expectedGrandTotal = formatAmount(mockSession.grandTotal, 'USD', 'en-US')
    expect(
      screen.getByText((_, element) => element?.tagName === 'DD' && element?.textContent === expectedGrandTotal)
    ).toBeInTheDocument()
  })

  it('renders the "Order summary" heading', () => {
    useCheckoutSessionStore.setState({ session: mockSession })
    renderOrderSummary()

    expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument()
  })

  it('renders all line items in a list', () => {
    useCheckoutSessionStore.setState({ session: mockSession })
    renderOrderSummary()

    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(mockSession.lines.length)
  })
})
