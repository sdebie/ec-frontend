import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAdminProductList } from '../hooks/useAdminProductList'
import { useBrands } from '../hooks/useBrands'
import { ProductsByBrandPage } from '../ProductsByBrandPage'

vi.mock('../hooks/useAdminProductList', () => ({
  useAdminProductList: vi.fn(),
}))
vi.mock('../hooks/useBrands', () => ({
  useBrands: vi.fn(),
}))

const mockProducts = {
  content: [
    {
      id: '1',
      name: 'Brand Product One',
      slug: 'brand-product-one',
      sku: 'SKU-B01',
      category: { id: 'cat-1', name: 'Electronics' },
      status: 'ACTIVE',
      thumbnailUrl: null,
      retailPrice: '149.99',
      stockCount: 10,
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

  vi.mocked(useBrands).mockReturnValue({
    data: [
      { id: 'brand-1', name: 'Nike' },
      { id: 'brand-2', name: 'Adidas' },
    ],
    isLoading: false,
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsByBrandPage />
    </MemoryRouter>,
  )
}

describe('ProductsByBrandPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('renders the page title "Products by Brand"', () => {
    renderPage()
    expect(screen.getByText('Products by Brand')).toBeInTheDocument()
  })

  it('calls useAdminProductList with brandId "ALL" initially (no brand filter)', () => {
    renderPage()

    expect(useAdminProductList).toHaveBeenCalledWith(
      expect.objectContaining({
        brandId: 'ALL',
      }),
    )
  })

  it('applies locked brand filter when a brand is selected via the shared Select', () => {
    renderPage()

    // ProductsByBrandPage uses the shared Select component (a button + listbox)
    fireEvent.click(screen.getByRole('button', { name: 'Filter by brand' }))
    fireEvent.click(screen.getByRole('option', { name: 'Nike' }))

    // After selecting, useAdminProductList should be called with the brandId
    const lastCall = vi.mocked(useAdminProductList).mock.calls.at(-1)
    expect(lastCall?.[0]).toMatchObject({
      brandId: 'brand-1',
    })
  })

  it('shows selected brand name as a label after selection', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Filter by brand' }))
    fireEvent.click(screen.getByRole('option', { name: 'Nike' }))

    // The selected brand name should appear as a visible badge/label
    // It renders inside a span with inline-flex styling
    const badges = document.querySelectorAll('span.inline-flex')
    const brandBadge = Array.from(badges).find((el) => el.textContent === 'Nike')
    expect(brandBadge).toBeTruthy()
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
