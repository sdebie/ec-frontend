import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'
import { ProductListPage } from '../ProductListPage'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

// --- Mocks ---

// Mock graphqlClient at the module boundary to intercept ALL requests and assert variables.
vi.mock('@/shared/api/graphql/graphqlClient', () => ({
  graphqlClient: {
    request: vi.fn(),
  },
}))

const mockedRequest = vi.mocked(graphqlClient.request)

const mockCategories = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics' },
]

const mockBrands = [
  { id: 'brand-1', name: 'Nike', slug: 'nike' },
]

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../hooks/useBrands', () => ({
  useBrands: () => ({
    brands: mockBrands,
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    }
    return selector ? selector(state) : state
  },
}))

// --- Helpers ---

function makeProductListResponse(count: number) {
  const products = Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Sale Product ${i + 1}`,
    slug: `sale-product-${i + 1}`,
    shortDescription: '',
    images: [{ id: `img${i}`, imageUrl: `https://example.com/img${i}.jpg`, featured: true, sortOrder: 0 }],
    retailPrice: { price: 100 },
    wholesalePrice: null,
    retailSalePrice: { price: 75 },
    wholesaleSalePrice: null,
  }))
  return {
    shoppingProductList: {
      content: products,
      totalElements: count,
      totalPages: Math.ceil(count / 20),
      pageSize: 20,
      pageIndex: 0,
    },
  }
}

function emptyResponse() {
  return {
    shoppingProductList: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      pageSize: 20,
      pageIndex: 0,
    },
  }
}

const storefrontConfig: StorefrontConfig = {
  branding: { name: 'Test Store' },
  clientId: 'test-client',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderOnSalePage(initialEntries: string[] = ['/specials']) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <StorefrontConfigContext.Provider value={storefrontConfig}>
        <MemoryRouter initialEntries={initialEntries}>
          <ProductListPage onSale />
        </MemoryRouter>
      </StorefrontConfigContext.Provider>
    </QueryClientProvider>,
  )
}

// --- Tests ---

describe('ProductListPage onSale — Property 4', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('onSale: true is present in every shoppingProductList request', () => {
    it('passes onSale: true in variables on initial load', async () => {
      mockedRequest.mockResolvedValue(makeProductListResponse(3))

      renderOnSalePage()

      await waitFor(() => {
        expect(mockedRequest).toHaveBeenCalled()
      })

      // Every call must include onSale: true in the variables
      const calls = mockedRequest.mock.calls
      for (const call of calls) {
        const variables = (call as unknown as [unknown, Record<string, unknown>])[1]
        expect(variables.onSale).toBe(true)
      }
    })

    it('passes onSale: true after a page change', async () => {
      // Return multi-page response so pagination renders
      const multiPageResponse = {
        shoppingProductList: {
          content: Array.from({ length: 20 }, (_, i) => ({
            id: `p${i + 1}`,
            name: `Sale Product ${i + 1}`,
            slug: `sale-product-${i + 1}`,
            shortDescription: '',
            images: [{ id: `img${i}`, imageUrl: `https://example.com/img${i}.jpg`, featured: true, sortOrder: 0 }],
            retailPrice: { price: 100 },
            wholesalePrice: null,
            retailSalePrice: { price: 75 },
            wholesaleSalePrice: null,
          })),
          totalElements: 40,
          totalPages: 2,
          pageSize: 20,
          pageIndex: 0,
        },
      }
      mockedRequest.mockResolvedValue(multiPageResponse)

      const user = userEvent.setup()
      renderOnSalePage()

      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByText('Sale Product 1')).toBeInTheDocument()
      })

      // Click "Next" button for pagination
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // After page change, assert ALL calls still include onSale: true
      await waitFor(() => {
        expect(mockedRequest.mock.calls.length).toBeGreaterThan(1)
      })

      for (const call of mockedRequest.mock.calls) {
        const variables = (call as unknown as [unknown, Record<string, unknown>])[1]
        expect(variables.onSale).toBe(true)
      }
    })

    it('passes onSale: true after a category filter change', async () => {
      mockedRequest.mockResolvedValue(makeProductListResponse(5))

      const user = userEvent.setup()
      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByText('Sale Product 1')).toBeInTheDocument()
      })

      // Change category filter via CategoryTreeFilter button
      const categoryButton = screen.getByRole('button', { name: 'Electronics' })
      await user.click(categoryButton)

      // After filter change, ALL calls must include onSale: true
      await waitFor(() => {
        expect(mockedRequest.mock.calls.length).toBeGreaterThan(1)
      })

      for (const call of mockedRequest.mock.calls) {
        const variables = (call as unknown as [unknown, Record<string, unknown>])[1]
        expect(variables.onSale).toBe(true)
      }
    })

    it('passes onSale: true after a brand filter change', async () => {
      mockedRequest.mockResolvedValue(makeProductListResponse(5))

      const user = userEvent.setup()
      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByText('Sale Product 1')).toBeInTheDocument()
      })

      // Change brand filter — expand the Brand filter group first
      const brandGroup = screen.getAllByRole('button', { name: /brand/i })[0]
      await user.click(brandGroup)

      // The brand filter is the shared Select (button + portal listbox). Two
      // buttons are named "Brand" — the FilterGroup header and the Select
      // trigger — so pick the trigger by its listbox popup attribute.
      const brandTrigger = screen
        .getAllByRole('button', { name: 'Brand' })
        .find((b) => b.getAttribute('aria-haspopup') === 'listbox')!
      await user.click(brandTrigger)
      await user.click(screen.getByRole('option', { name: 'Nike' }))

      // After filter change, ALL calls must include onSale: true
      await waitFor(() => {
        expect(mockedRequest.mock.calls.length).toBeGreaterThan(1)
      })

      for (const call of mockedRequest.mock.calls) {
        const variables = (call as unknown as [unknown, Record<string, unknown>])[1]
        expect(variables.onSale).toBe(true)
      }
    })
  })

  describe('sale heading and empty-state rendering', () => {
    it('renders "Specials" heading when onSale is true', async () => {
      mockedRequest.mockResolvedValue(makeProductListResponse(2))

      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Specials')
      })
    })

    it('renders sale-specific empty state when no products match', async () => {
      mockedRequest.mockResolvedValue(emptyResponse())

      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByText('No specials match your filters.')).toBeInTheDocument()
      })
    })
  })

  describe('server-side pagination — rendered count equals returned items', () => {
    it('renders exactly the number of products returned by the server (no client-side slicing)', async () => {
      const serverCount = 7
      mockedRequest.mockResolvedValue(makeProductListResponse(serverCount))

      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByText('Sale Product 1')).toBeInTheDocument()
      })

      // All server-returned products should render
      for (let i = 1; i <= serverCount; i++) {
        expect(screen.getByText(`Sale Product ${i}`)).toBeInTheDocument()
      }

      // No extra products beyond what the server returned
      expect(screen.queryByText(`Sale Product ${serverCount + 1}`)).not.toBeInTheDocument()
    })

    it('page change updates page variable in the request (server-side refetch, not client-side slice)', async () => {
      const multiPageResponse = {
        shoppingProductList: {
          content: Array.from({ length: 20 }, (_, i) => ({
            id: `p${i + 1}`,
            name: `Sale Product ${i + 1}`,
            slug: `sale-product-${i + 1}`,
            shortDescription: '',
            images: [{ id: `img${i}`, imageUrl: `https://example.com/img${i}.jpg`, featured: true, sortOrder: 0 }],
            retailPrice: { price: 100 },
            wholesalePrice: null,
            retailSalePrice: { price: 75 },
            wholesaleSalePrice: null,
          })),
          totalElements: 40,
          totalPages: 2,
          pageSize: 20,
          pageIndex: 0,
        },
      }
      mockedRequest.mockResolvedValue(multiPageResponse)

      const user = userEvent.setup()
      renderOnSalePage()

      await waitFor(() => {
        expect(screen.getByText('Sale Product 1')).toBeInTheDocument()
      })

      // Initial request should be for page 0 (pageIndex)
      const initialCall = mockedRequest.mock.calls[0]
      const initialVars = (initialCall as unknown as [unknown, Record<string, unknown>])[1]
      expect(initialVars.pageIndex).toBe(0)

      // Click next page
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // After page change, a new request is made with pageIndex: 1
      await waitFor(() => {
        const lastCall = mockedRequest.mock.calls[mockedRequest.mock.calls.length - 1]
        const lastVars = (lastCall as unknown as [unknown, Record<string, unknown>])[1]
        expect(lastVars.pageIndex).toBe(1)
      })
    })
  })
})
