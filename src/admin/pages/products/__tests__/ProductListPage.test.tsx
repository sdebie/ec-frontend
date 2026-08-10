import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAdminProductList } from '@/admin/hooks/products/useAdminProductList'
import { useDeleteProductGql } from '@/admin/hooks/products/useDeleteProductGql'
import { useUpdateProductStatusGql } from '@/admin/hooks/products/useUpdateProductStatusGql'
import { useProductStats } from '@/admin/hooks/products/useProductStats'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { useBrands } from '@/admin/hooks/products/useBrands'
import * as authorizationHelper from '@/shared/utils/authorizationHelper'
import { ProductListPage } from '../ProductListPage'

const mockRefetch = vi.fn()
const mockDeleteMutate = vi.fn()
const mockStatusMutate = vi.fn()
const mockStatusMutateAsync = vi.fn().mockResolvedValue({})
const mockNavigate = vi.fn()

vi.mock('@/admin/hooks/products/useAdminProductList', () => ({
  useAdminProductList: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useDeleteProductGql', () => ({
  useDeleteProductGql: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useUpdateProductStatusGql', () => ({
  useUpdateProductStatusGql: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useZeroProductStock', () => ({
  useZeroProductStock: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('@/admin/hooks/products/useProductStats', () => ({
  useProductStats: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useBrands', () => ({
  useBrands: vi.fn(),
}))
vi.mock('@/shared/utils/authorizationHelper', () => ({
  canManageCatalog: vi.fn(),
  hasRequiredAuthority: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockProducts = {
  content: [
    {
      id: '1',
      name: 'Test Product',
      slug: 'test-product',
      sku: 'SKU-001',
      category: { id: 'cat-1', name: 'Electronics' },
      status: 'ACTIVE',
      thumbnailUrl: null,
      retailPrice: '99.99',
      stockCount: 25,
      stockLevel: 'IN_STOCK',
    },
  ],
  totalElements: 1,
  totalPages: 1,
}

function setupDefaultMocks(overrides?: {
  useAdminProductListReturn?: Partial<ReturnType<typeof useAdminProductList>>
  role?: string
}) {
  vi.mocked(useAdminProductList).mockReturnValue({
    data: mockProducts,
    isLoading: false,
    refetch: mockRefetch,
    ...overrides?.useAdminProductListReturn,
  } as ReturnType<typeof useAdminProductList>)

  vi.mocked(useProductStats).mockReturnValue({
    data: { total: 10, active: 5, pending: 3, disabled: 2 },
    isLoading: false,
    isError: false,
  })

  vi.mocked(useDeleteProductGql).mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteProductGql>)

  vi.mocked(useUpdateProductStatusGql).mockReturnValue({
    mutate: mockStatusMutate,
    mutateAsync: mockStatusMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProductStatusGql>)

  vi.mocked(useCategories).mockReturnValue({
    data: [{ id: 'cat-1', name: 'Electronics' }],
    isLoading: false,
  })

  vi.mocked(useBrands).mockReturnValue({
    data: [{ id: 'brand-1', name: 'Acme' }],
    isLoading: false,
  })

  vi.mocked(authorizationHelper.canManageCatalog).mockReturnValue(
    overrides?.role === 'VIEWER' || overrides?.role === 'ORDER_MANAGER'
      ? false
      : true,
  )
  vi.mocked(authorizationHelper.hasRequiredAuthority).mockReturnValue(
    overrides?.role !== 'VIEWER' && overrides?.role !== 'ORDER_MANAGER',
  )
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>,
  )
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('renders DataTable skeleton when isLoading is true', () => {
      setupDefaultMocks({
        useAdminProductListReturn: { data: undefined, isLoading: true },
      })

      renderPage()

      const pulsingElements = document.querySelectorAll('.animate-pulse')
      expect(pulsingElements.length).toBeGreaterThan(0)
    })
  })

  describe('status filter reset', () => {
    it('resets pageIndex to 0 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      // The status filter is a <select> element
      const statusSelect = screen.getByDisplayValue('All')
      fireEvent.change(statusSelect, { target: { value: 'ACTIVE' } })

      // After the filter change, useAdminProductList should be called with pageIndex=0
      const lastCall = vi.mocked(useAdminProductList).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ pageIndex: 0 })
    })
  })

  describe('delete confirmation dialog', () => {
    it('opens ConfirmationDialog with product name when delete is clicked', () => {
      setupDefaultMocks()

      renderPage()

      // Delete is now an inline icon button in the Actions column
      fireEvent.click(screen.getByTestId('action-delete'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByText(/Delete "Test Product"\?/),
      ).toBeInTheDocument()
    })
  })

  describe('VIEWER role', () => {
    it('hides Add Product button and mutating actions for VIEWER role', () => {
      setupDefaultMocks({ role: 'VIEWER' })

      renderPage()

      expect(screen.queryByRole('button', { name: /add product/i })).not.toBeInTheDocument()
      expect(screen.queryByTestId('action-delete')).not.toBeInTheDocument()
      expect(screen.queryByTestId('action-out-of-stock')).not.toBeInTheDocument()
    })
  })

  describe('bulk status update', () => {
    it('shows the bulk bar when rows are selected and dispatches one update per product', async () => {
      setupDefaultMocks()

      renderPage()

      // No bar until something is selected
      expect(screen.queryByTestId('bulk-mark-active')).not.toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Select all rows'))
      expect(screen.getByText(/selected/)).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('bulk-mark-active'))

      await waitFor(() => {
        expect(mockStatusMutateAsync).toHaveBeenCalledWith({ id: '1', status: 'ACTIVE' })
      })

      // Selection clears after the batch completes
      await waitFor(() => {
        expect(screen.queryByTestId('bulk-mark-active')).not.toBeInTheDocument()
      })
    })

    it('Mark Inactive sends DISABLED for every selected product', async () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByLabelText('Select all rows'))
      fireEvent.click(screen.getByTestId('bulk-mark-inactive'))

      await waitFor(() => {
        expect(mockStatusMutateAsync).toHaveBeenCalledWith({ id: '1', status: 'DISABLED' })
      })
    })
  })

  describe('ORDER_MANAGER role', () => {
    it('hides Add Product button and mutating actions for ORDER_MANAGER role', () => {
      setupDefaultMocks({ role: 'ORDER_MANAGER' })

      renderPage()

      expect(screen.queryByRole('button', { name: /add product/i })).not.toBeInTheDocument()
      expect(screen.queryByTestId('action-delete')).not.toBeInTheDocument()
      expect(screen.queryByTestId('action-out-of-stock')).not.toBeInTheDocument()
    })
  })
})
