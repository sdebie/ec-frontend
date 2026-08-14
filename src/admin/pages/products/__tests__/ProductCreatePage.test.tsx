/**
 * Feature: admin-product-write, Task 6.1
 * Page-level test — exercises form validation (no variant, blank SKU, duplicate SKU,
 * non-positive price) and verifies the mutation is NOT called when validation fails.
 * The hook is NOT fully mocked — only adminGraphqlClient.request is mocked so the
 * real mapping code executes on valid submissions.
 *
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { ProductCreatePage } from '../ProductCreatePage'

// Mock only the boundary — adminGraphqlClient.request — not the hooks
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
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/shared/ui/components/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    )
}

function renderPage() {
  return render(createElement(ProductCreatePage), { wrapper: createWrapper() })
}

describe('ProductCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form in create mode', () => {
    renderPage()
    expect(screen.getByText('Add Product')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Product name')).toBeInTheDocument()
    expect(screen.getByText('Create Product')).toBeInTheDocument()
  })

  it('auto-generates slug from name field', async () => {
    const user = userEvent.setup()
    renderPage()

    const nameInput = screen.getByPlaceholderText('Product name')
    await user.type(nameInput, 'My Cool Product')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('product-slug')).toHaveValue('my-cool-product')
    })
  })

  it('navigates to /admin/products on cancel without calling the mutation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/admin/products')
    expect(adminGraphqlClient.request).not.toHaveBeenCalled()
  })

  describe('Validation blocks submission (Req 2.5)', () => {
    it('blocks submission when variant has blank SKU (mutation not called)', async () => {
      const user = userEvent.setup()
      renderPage()

      // Fill product name but leave variant SKU blank, fill price
      await user.type(screen.getByPlaceholderText('Product name'), 'SKU Test')
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.type(screen.getByPlaceholderText('e.g. 99.99'), '19.99')

      // Submit — SKU still blank
      await user.click(screen.getByRole('button', { name: 'Create Product' }))

      await waitFor(() => {
        expect(screen.getByText('SKU is required')).toBeInTheDocument()
      })

      expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    })

    it('prevents removing the last variant (at least one variant required)', () => {
      renderPage()

      // Remove button should be disabled when there's only 1 variant
      const removeBtn = screen.getByTestId('remove-variant-0')
      expect(removeBtn).toBeDisabled()
    })

    it('blocks submission when duplicate SKUs exist within the form', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByPlaceholderText('Product name'), 'Dup SKU')
      await user.click(screen.getByRole('tab', { name: /variants/i }))

      // Fill first variant
      const skuInput = screen.getByPlaceholderText('e.g. PROD-001')
      await user.type(skuInput, 'SAME-SKU')
      await user.type(screen.getByPlaceholderText('e.g. 99.99'), '19.99')

      await user.click(screen.getByTestId('add-variant'))

      // Fill second variant with same SKU
      const allSkuInputs = screen.getAllByPlaceholderText('e.g. PROD-001')
      await user.type(allSkuInputs[1], 'SAME-SKU')
      const allPriceInputs = screen.getAllByPlaceholderText('e.g. 99.99')
      await user.type(allPriceInputs[1], '29.99')

      // Submit
      await user.click(screen.getByRole('button', { name: 'Create Product' }))

      await waitFor(() => {
        expect(screen.getByText('Duplicate SKU')).toBeInTheDocument()
      })

      expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    })

    it('blocks submission when price is zero (non-positive)', async () => {
      const user = userEvent.setup()
      renderPage()

      // Fill product name and SKU, set price to 0
      await user.type(screen.getByPlaceholderText('Product name'), 'Zero Price')
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.type(screen.getByPlaceholderText('e.g. PROD-001'), 'ZP-001')
      await user.type(screen.getByPlaceholderText('e.g. 99.99'), '0')

      // Submit
      await user.click(screen.getByRole('button', { name: 'Create Product' }))

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })

      expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    })

    it('blocks submission when price is 0.00 (non-positive)', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByPlaceholderText('Product name'), 'Zero Price 2')
      await user.click(screen.getByRole('tab', { name: /variants/i }))
      await user.type(screen.getByPlaceholderText('e.g. PROD-001'), 'ZP-002')
      await user.type(screen.getByPlaceholderText('e.g. 99.99'), '0.00')

      await user.click(screen.getByRole('button', { name: 'Create Product' }))

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })

      expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    })
  })
})
