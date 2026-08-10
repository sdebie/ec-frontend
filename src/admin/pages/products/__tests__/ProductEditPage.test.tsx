/**
 * Feature: admin-product-write, Task 6.1
 * Page-level test — exercises the edit page's not-found handling when GraphQL returns null,
 * form population from useProductDetail, and validation blocking.
 * Mocks adminGraphqlClient.request (not the hooks) so the mapping code executes.
 *
 * Validates: Requirements 1.3, 2.5, 8.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { ProductEditPage } from '../ProductEditPage'

// Mock only the boundary — adminGraphqlClient.request
vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(() => ({
    data: [{ id: 'cat-1', name: 'Electronics' }],
    isLoading: false,
  })),
}))

vi.mock('@/admin/hooks/media', () => ({
  useMediaUpload: () => ({ upload: vi.fn().mockResolvedValue('uploaded.jpg'), isUploading: false }),
  useMediaDelete: () => ({ remove: vi.fn().mockResolvedValue(undefined), isDeleting: false }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ productId: 'prod-123' }),
  }
})

vi.mock('@/shared/ui/components/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    )
}

function renderPage() {
  return render(createElement(ProductEditPage), { wrapper: createWrapper() })
}

// Standard mock response representing a loaded product
const mockGraphqlResponse = {
  getProductInformation: {
    product: {
      id: 'prod-123',
      name: 'Test Widget',
      slug: 'test-widget',
      shortDescription: 'A test widget',
      description: 'Detailed description',
      status: 'ACTIVE',
      categories: [{ id: 'cat-1', name: 'Electronics' }],
    },
    variants: [
      {
        id: 'var-1',
        sku: 'WDG-001',
        stockQuantity: 10,
        status: 'ACTIVE',
        prices: [{ id: 'price-1', price: 49.99, priceType: 'RETAIL_PRICE' }],
        images: [{ id: 'img-1', imageUrl: 'widget.jpg', featured: true, sortOrder: 0 }],
      },
    ],
  },
}

describe('ProductEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Not-found state (Req 1.3)', () => {
    it('renders not-found when getProductInformation returns null', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        getProductInformation: null,
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Not Found')).toBeInTheDocument()
      })
      expect(screen.getByText('Product not found')).toBeInTheDocument()
      expect(screen.getByText('Back to products')).toHaveAttribute('href', '/admin/products')
    })
  })

  describe('Form population from GraphQL response', () => {
    it('populates form fields after useProductDetail maps the GraphQL response', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockGraphqlResponse)

      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Product name')).toHaveValue('Test Widget')
      })

      expect(screen.getByPlaceholderText('product-slug')).toHaveValue('test-widget')
      expect(screen.getByPlaceholderText('Brief product summary')).toHaveValue('A test widget')
      expect(screen.getByText('Edit Product')).toBeInTheDocument()
    })
  })

  describe('Validation blocks submission (Req 2.5)', () => {
    it('blocks submission when SKU is cleared to blank', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockGraphqlResponse)
      const user = userEvent.setup()

      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Product name')).toHaveValue('Test Widget')
      })

      // Server-hydrated rows start read-only — open the row for editing first
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.click(screen.getByTestId('edit-variant-0'))
      const skuInput = screen.getByDisplayValue('WDG-001')
      await user.clear(skuInput)

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('SKU is required')).toBeInTheDocument()
      })

      // Mutation for update should NOT have been called (only the initial read query)
      const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
      const mutationCalls = calls.filter(([doc]) =>
        String(doc).includes('updateProductInformation'),
      )
      expect(mutationCalls).toHaveLength(0)
    })

    it('blocks submission when price is changed to non-positive value', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockGraphqlResponse)
      const user = userEvent.setup()

      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Product name')).toHaveValue('Test Widget')
      })

      // Change price to 0 (open the read-only row for editing first)
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.click(screen.getByTestId('edit-variant-0'))
      const priceInput = screen.getByDisplayValue('49.99')
      await user.clear(priceInput)
      await user.type(priceInput, '0')

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })

      // Verify no update mutation was called
      const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
      const mutationCalls = calls.filter(([doc]) =>
        String(doc).includes('updateProductInformation'),
      )
      expect(mutationCalls).toHaveLength(0)
    })

    it('blocks submission with duplicate SKUs across variants', async () => {
      // Response with two variants
      const twoVariantResponse = {
        getProductInformation: {
          ...mockGraphqlResponse.getProductInformation,
          variants: [
            {
              id: 'var-1',
              sku: 'WDG-001',
              stockQuantity: 10,
              status: 'ACTIVE',
              prices: [{ id: 'p1', price: 49.99, priceType: 'RETAIL_PRICE' }],
              images: [],
            },
            {
              id: 'var-2',
              sku: 'WDG-002',
              stockQuantity: 5,
              status: 'ACTIVE',
              prices: [{ id: 'p2', price: 29.99, priceType: 'RETAIL_PRICE' }],
              images: [],
            },
          ],
        },
      }
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(twoVariantResponse)
      const user = userEvent.setup()

      renderPage()

      // Read-only rows render the SKU as text, not an input
      await waitFor(() => {
        expect(screen.getByText('WDG-001')).toBeInTheDocument()
      })

      // Change second variant SKU to match first (open its row for editing first)
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.click(screen.getByTestId('edit-variant-1'))
      const secondSku = screen.getByDisplayValue('WDG-002')
      await user.clear(secondSku)
      await user.type(secondSku, 'WDG-001')

      // Submit
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByText('Duplicate SKU')).toBeInTheDocument()
      })

      // No update mutation
      const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
      const mutationCalls = calls.filter(([doc]) =>
        String(doc).includes('updateProductInformation'),
      )
      expect(mutationCalls).toHaveLength(0)
    })
  })

  describe('Successful update sends mutation via adminGraphqlClient', () => {
    it('calls updateProductInformation with correct variables on valid submit', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockGraphqlResponse)
      const user = userEvent.setup()

      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Product name')).toHaveValue('Test Widget')
      })

      // Mock the update mutation response
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        updateProductInformation: {
          product: { id: 'prod-123', name: 'Test Widget', slug: 'test-widget', status: 'ACTIVE' },
          variants: [{ id: 'var-1', sku: 'WDG-001', stockQuantity: 10, prices: [], images: [] }],
        },
      })

      // Submit the form (all fields are valid from the loaded product)
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
        const mutationCalls = calls.filter(([doc]) =>
          String(doc).includes('updateProductInformation'),
        )
        expect(mutationCalls.length).toBeGreaterThanOrEqual(1)
      })

      // Verify productId was sent
      const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
      const mutationCall = calls.find(([doc]) =>
        String(doc).includes('updateProductInformation'),
      )
      expect(mutationCall).toBeDefined()
      const variables = mutationCall![1] as { productId: string }
      expect(variables.productId).toBe('prod-123')
    })
  })
})
