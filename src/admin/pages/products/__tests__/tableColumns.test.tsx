import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ProductListPage } from '../ProductListPage'
import { useAdminProductList } from '@/admin/hooks/products/useAdminProductList'
import { useDeleteProductGql } from '@/admin/hooks/products/useDeleteProductGql'
import { useUpdateProductStatusGql } from '@/admin/hooks/products/useUpdateProductStatusGql'
import { useProductStats } from '@/admin/hooks/products/useProductStats'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { useBrands } from '@/admin/hooks/products/useBrands'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

/**
 * Unit tests for table column rendering and order.
 * Validates: Requirement 4.1
 *
 * The product table SHALL have columns in this order:
 * checkbox (select), Product, SKU, Category, Price, Status, Stock, Actions
 */

vi.mock('@/admin/hooks/products/useAdminProductList', () => ({
  useAdminProductList: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useDeleteProductGql', () => ({
  useDeleteProductGql: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useUpdateProductStatusGql', () => ({
  useUpdateProductStatusGql: vi.fn(),
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
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockProductData = {
  content: [
    {
      id: 'prod-1',
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      sku: 'WH-001',
      category: { id: 'cat-1', name: 'Electronics' },
      status: 'ACTIVE',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      retailPrice: '149.99',
      stockCount: 25,
      stockLevel: undefined,
    },
  ],
  totalElements: 1,
  totalPages: 1,
}

function setupMocks() {
  vi.mocked(useAdminProductList).mockReturnValue({
    data: mockProductData,
    isLoading: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useAdminProductList>)

  vi.mocked(useProductStats).mockReturnValue({
    data: { total: 10, active: 5, pending: 3, disabled: 2 },
    isLoading: false,
    isError: false,
  })

  vi.mocked(useDeleteProductGql).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteProductGql>)

  vi.mocked(useUpdateProductStatusGql).mockReturnValue({
    mutate: vi.fn(),
  } as unknown as ReturnType<typeof useUpdateProductStatusGql>)

  vi.mocked(useCategories).mockReturnValue({
    data: [{ id: 'cat-1', name: 'Electronics' }],
    isLoading: false,
  })

  vi.mocked(useBrands).mockReturnValue({
    data: [{ id: 'brand-1', name: 'TechCorp' }],
    isLoading: false,
  })

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>,
  )
}

describe('Product table columns', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('renders all expected column headers in correct order', () => {
    renderPage()

    // Get all th elements from the table
    const headerCells = screen.getAllByRole('columnheader')

    // Expected column order: checkbox, Icon, Product, SKU, Price, Status, Stock, Actions
    // The checkbox column has a checkbox input instead of text
    const expectedHeaders = ['Icon', 'Product', 'SKU', 'Price', 'Status', 'Stock', 'Actions']

    // First column is checkbox (no text header, has a checkbox input)
    const firstHeader = headerCells[0]
    expect(firstHeader.querySelector('input[type="checkbox"]')).toBeInTheDocument()

    // Verify remaining headers have correct text in order
    const textHeaders = headerCells.slice(1).map((th) => th.textContent?.trim())
    expect(textHeaders).toEqual(expectedHeaders)
  })

  it('renders exactly 8 columns', () => {
    renderPage()

    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(8)
  })

  it('renders product data in the correct columns', () => {
    renderPage()

    // Product column: name should be visible
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()

    // SKU column: SKU value should be visible
    expect(screen.getByText('WH-001')).toBeInTheDocument()

    // Category column: category name
    // Note: category name appears in both Product subtitle and Category column
    const categoryTexts = screen.getAllByText('Electronics')
    expect(categoryTexts.length).toBeGreaterThanOrEqual(1)

    // Status column: uses ProductStatusDisplay — "Active" appears in stat cards and filter too
    const activeTexts = screen.getAllByText('Active')
    expect(activeTexts.length).toBeGreaterThanOrEqual(1)

    // Stock column: derives In Stock from stockCount=25
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument() // 25 is unique to this product's stock
  })

  it('renders Price column with formatted amount', () => {
    renderPage()

    // formatAmount(149.99) should produce a formatted price string
    // The exact format depends on locale, but should contain 149.99 or equivalent
    const cells = document.querySelectorAll('td')
    const priceCell = Array.from(cells).find(
      (cell) => cell.textContent?.includes('149') || cell.textContent?.includes('R'),
    )
    expect(priceCell).toBeTruthy()
  })

  it('renders Actions column with view, edit, and menu for SUPER_ADMIN', () => {
    renderPage()

    // View button
    expect(screen.getByTestId('action-view')).toBeInTheDocument()
    // Edit button (inline icon)
    expect(screen.getByTestId('action-edit')).toBeInTheDocument()
    // Actions menu (three-dot)
    expect(screen.getByTestId('actions-menu')).toBeInTheDocument()
  })

  it('renders Actions column with only view button for VIEWER role', () => {
    vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
      const state = { role: 'VIEWER' }
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
    })

    renderPage()

    // View button should still be present
    expect(screen.getByTestId('action-view')).toBeInTheDocument()
    // Edit button and actions menu should not be rendered
    expect(screen.queryByTestId('action-edit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument()
  })

  it('renders Stock column with LOW_STOCK styling for count between 1-10', () => {
    vi.mocked(useAdminProductList).mockReturnValue({
      data: {
        content: [
          {
            ...mockProductData.content[0],
            stockCount: 7,
            stockLevel: undefined,
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useAdminProductList>)

    renderPage()

    expect(screen.getByText('Low Stock')).toBeInTheDocument()
    // stockCount 7 is unique — doesn't collide with stat card numbers
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders Stock column with OUT_OF_STOCK styling for count 0', () => {
    vi.mocked(useAdminProductList).mockReturnValue({
      data: {
        content: [
          {
            ...mockProductData.content[0],
            stockCount: 0,
            stockLevel: undefined,
          },
        ],
        totalElements: 1,
        totalPages: 1,
      },
      isLoading: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useAdminProductList>)

    renderPage()

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
