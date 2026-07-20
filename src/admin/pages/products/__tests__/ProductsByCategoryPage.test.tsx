import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAdminProductList } from '@/admin/hooks/products/useAdminProductList'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { ProductsByCategoryPage } from '../ProductsByCategoryPage'

vi.mock('@/admin/hooks/products/useAdminProductList', () => ({
  useAdminProductList: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(),
}))

const mockProducts = {
  content: [
    {
      id: '1',
      name: 'Product One',
      slug: 'product-one',
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

function setupMocks() {
  vi.mocked(useAdminProductList).mockReturnValue({
    data: mockProducts,
    isLoading: false,
    refetch: vi.fn(),
  } as ReturnType<typeof useAdminProductList>)

  vi.mocked(useCategories).mockReturnValue({
    data: [
      { id: 'cat-1', name: 'Electronics' },
      { id: 'cat-2', name: 'Clothing' },
    ],
    isLoading: false,
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsByCategoryPage />
    </MemoryRouter>,
  )
}

describe('ProductsByCategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('renders the page title "Products by Category"', () => {
    renderPage()
    expect(screen.getByText('Products by Category')).toBeInTheDocument()
  })

  it('calls useAdminProductList without categoryId when no category is selected', () => {
    renderPage()

    expect(useAdminProductList).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: undefined,
      }),
    )
  })

  it('applies locked category filter when a category is selected', () => {
    renderPage()

    // The Select component renders a button accessible by its label "Category"
    const selectButton = screen.getByRole('button', { name: /category/i })
    fireEvent.click(selectButton)

    // The listbox options appear
    const electronicsOption = screen.getByRole('option', { name: 'Electronics' })
    fireEvent.click(electronicsOption)

    // After selecting, useAdminProductList should be called with the categoryId
    const lastCall = vi.mocked(useAdminProductList).mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({
      categoryId: 'cat-1',
    })
  })

  it('shows selected category name as a label after selection', () => {
    renderPage()

    const selectButton = screen.getByRole('button', { name: /category/i })
    fireEvent.click(selectButton)

    const electronicsOption = screen.getByRole('option', { name: 'Electronics' })
    fireEvent.click(electronicsOption)

    // The selected category name should appear as a visible badge/label
    // It renders inside a span with specific styling (rounded-full, font-medium)
    const badges = document.querySelectorAll('span.inline-flex')
    const categoryBadge = Array.from(badges).find((el) => el.textContent === 'Electronics')
    expect(categoryBadge).toBeTruthy()
  })

  it('does not render stat cards', () => {
    renderPage()

    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument()

    const statCards = document.querySelectorAll('[data-testid*="stat-card"]')
    expect(statCards.length).toBe(0)
  })
})
