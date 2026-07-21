import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { useQuoteStore } from '../quoteStore'
import { QuoteProductSearch } from '../components/QuoteProductSearch'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

// Mock the graphqlClient instance directly (the real transport layer)
vi.mock('@/shared/api/graphql/graphqlClient', () => ({
  graphqlClient: {
    request: vi.fn(),
  },
}))

import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

const mockConfig: StorefrontConfig = {
  clientId: 'test',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
  branding: { name: 'Test Store' },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        StorefrontConfigContext.Provider,
        { value: mockConfig },
        createElement(MemoryRouter, null, children),
      ),
    )
}

const mockProducts = [
  {
    id: 'p1',
    name: 'Widget Pro',
    slug: 'widget-pro',
    shortDescription: 'Blue / Large',
    variantId: 'v-1',
    images: [{ id: 'img1', imageUrl: 'images/widget.png', featured: true, sortOrder: 1 }],
    retailPrice: { price: 99.99 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
  },
  {
    id: 'p2',
    name: 'Gadget Lite',
    slug: 'gadget-lite',
    shortDescription: 'Red / Small',
    variantId: 'v-2',
    images: [],
    retailPrice: { price: 49.50 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
  },
]

function mockGraphqlResponse(content: unknown[] = mockProducts) {
  vi.mocked(graphqlClient.request).mockResolvedValue({
    shoppingProductList: {
      content,
      totalElements: content.length,
      totalPages: content.length > 0 ? 1 : 0,
      pageSize: 20,
      pageIndex: 0,
    },
  })
}

describe('QuoteProductSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useQuoteStore.setState({ items: [], itemCount: 0 })
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search input', () => {
    mockGraphqlResponse([])
    render(<QuoteProductSearch />, { wrapper: createWrapper() })
    expect(screen.getByLabelText('Search products')).toBeInTheDocument()
  })

  it('debounces search input and triggers useProducts with mocked transport', async () => {
    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })

    // Before debounce fires, no request yet
    expect(graphqlClient.request).not.toHaveBeenCalled()

    // Advance past the 400ms debounce
    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(graphqlClient.request).toHaveBeenCalled()
    })
  })

  it('renders product name and variant info in results', async () => {
    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    })

    expect(screen.getByText('Blue / Large')).toBeInTheDocument()
    expect(screen.getByText('Gadget Lite')).toBeInTheDocument()
    expect(screen.getByText('Red / Small')).toBeInTheDocument()
  })

  it('selecting a result adds to quoteStore', async () => {
    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    })

    // Click the button inside the first product option (the <button> within <li role="option">)
    const widgetButton = screen.getByText('Widget Pro').closest('button')!
    fireEvent.click(widgetButton)

    const { items } = useQuoteStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].variantId).toBe('v-1')
    expect(items[0].productName).toBe('Widget Pro')
    expect(items[0].quantity).toBe(1)
  })

  it('added items show "Added" marker', async () => {
    // Pre-populate store with one item
    useQuoteStore.setState({
      items: [
        { variantId: 'v-1', productName: 'Widget Pro', variantLabel: 'Blue / Large', quantity: 1 },
      ],
      itemCount: 1,
    })

    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    })

    expect(screen.getByText('Added')).toBeInTheDocument()
  })

  it('shows empty results message when search yields no products', async () => {
    mockGraphqlResponse([])

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'nonexistent' } })
    })

    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  it('clears the search and closes results when clicking outside the panel', async () => {
    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })
    await act(async () => {
      vi.advanceTimersByTime(450)
    })
    await waitFor(() => {
      expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    })

    // Click outside the search panel (document body)
    await act(async () => {
      fireEvent.mouseDown(document.body)
    })

    expect(screen.queryByText('Widget Pro')).not.toBeInTheDocument()
    expect((screen.getByLabelText('Search products') as HTMLInputElement).value).toBe('')
  })

  it('keeps results open when clicking inside the panel', async () => {
    mockGraphqlResponse()

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Search products')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Widget' } })
    })
    await act(async () => {
      vi.advanceTimersByTime(450)
    })
    await waitFor(() => {
      expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.mouseDown(input)
    })

    expect(screen.getByText('Widget Pro')).toBeInTheDocument()
  })

  // Regression guard: shoppingProductList carries variantId ONLY for SIMPLE
  // products — multi-variant rows must expand an inline picker, not render dead.
  it('expands an inline variant picker for multi-variant products and adds the chosen variant', async () => {
    const multiVariantProduct = {
      id: 'p3',
      name: 'Vest Multi',
      slug: 'vest-multi',
      shortDescription: 'Multiple sizes',
      variantId: null,
      images: [],
      retailPrice: { price: 120 },
      wholesalePrice: null,
      retailSalePrice: null,
      wholesaleSalePrice: null,
    }
    vi.mocked(graphqlClient.request).mockResolvedValue({
      shoppingProductList: {
        content: [multiVariantProduct],
        totalElements: 1,
        totalPages: 1,
        pageSize: 20,
        pageIndex: 0,
      },
      getProductInformationBySlug: {
        product: {
          id: 'p3',
          name: 'Vest Multi',
          slug: 'vest-multi',
          shortDescription: null,
          description: null,
          category: null,
          brand: null,
        },
        variants: [
          {
            id: 'var-1',
            stockQuantity: 5,
            attributesJson: '{"Size":"M"}',
            images: [],
            prices: [{ priceType: 'RETAIL_PRICE', price: 120 }],
          },
          {
            id: 'var-2',
            stockQuantity: 5,
            attributesJson: '{"Size":"L"}',
            images: [],
            prices: [{ priceType: 'RETAIL_PRICE', price: 130 }],
          },
        ],
      },
    } as never)

    render(<QuoteProductSearch />, { wrapper: createWrapper() })

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Search products'), {
        target: { value: 'Vest' },
      })
    })
    await act(async () => {
      vi.advanceTimersByTime(450)
    })

    await waitFor(() => {
      expect(screen.getByText('Vest Multi')).toBeInTheDocument()
    })

    // The multi-variant row is enabled and shows the Options affordance
    const row = screen.getByText('Vest Multi').closest('button')!
    expect(row).not.toBeDisabled()
    expect(screen.getByText('Options')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(row)
    })

    // Picker loads variants via the real useProductDetail hook (mocked transport)
    await waitFor(() => {
      expect(screen.getByText('L')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByText('L'))
    })

    expect(useQuoteStore.getState().items).toEqual([
      expect.objectContaining({
        variantId: 'var-2',
        productName: 'Vest Multi',
        variantLabel: 'L',
        quantity: 1,
      }),
    ])
  })
})
