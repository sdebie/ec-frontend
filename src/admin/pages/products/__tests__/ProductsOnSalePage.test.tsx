import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useOnSaleProducts } from '@/admin/hooks/products/useOnSaleProducts'
import { useCategories } from '@/admin/hooks/products/useCategories'
import { useBrands } from '@/admin/hooks/products/useBrands'
import { ProductsOnSalePage } from '../ProductsOnSalePage'

vi.mock('@/admin/hooks/products/useOnSaleProducts', () => ({
  useOnSaleProducts: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(),
}))
vi.mock('@/admin/hooks/products/useBrands', () => ({
  useBrands: vi.fn(),
}))

const mockOnSaleProducts = [
  {
    id: '1',
    name: 'Sale Product A',
    slug: 'sale-product-a',
    thumbnailUrl: null,
    retailPrice: '199.99',
    salePrice: '149.99',
    category: { id: 'cat-1', name: 'Electronics' },
  },
  {
    id: '2',
    name: 'Sale Product B',
    slug: 'sale-product-b',
    thumbnailUrl: null,
    retailPrice: '59.99',
    salePrice: '39.99',
    category: { id: 'cat-2', name: 'Clothing' },
  },
]

function setupMocks() {
  vi.mocked(useOnSaleProducts).mockReturnValue({
    data: mockOnSaleProducts,
    isLoading: false,
    refetch: vi.fn(),
  })

  vi.mocked(useCategories).mockReturnValue({
    data: [
      { id: 'cat-1', name: 'Electronics' },
      { id: 'cat-2', name: 'Clothing' },
    ],
    isLoading: false,
  })

  vi.mocked(useBrands).mockReturnValue({
    data: [{ id: 'brand-1', name: 'Acme' }],
    isLoading: false,
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsOnSalePage />
    </MemoryRouter>,
  )
}

describe('ProductsOnSalePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  it('renders the page title "Products on Sale"', () => {
    renderPage()
    expect(screen.getByText('Products on Sale')).toBeInTheDocument()
  })

  it('does not render stat cards', () => {
    renderPage()

    // Stat cards typically show labels like Total, Active, Pending, Disabled
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText('Disabled')).not.toBeInTheDocument()

    // No elements with stat-card related test ids or class names
    const statCards = document.querySelectorAll('[data-testid*="stat-card"]')
    expect(statCards.length).toBe(0)
  })

  it('renders product data in the table', () => {
    renderPage()

    expect(screen.getByText('Sale Product A')).toBeInTheDocument()
    expect(screen.getByText('Sale Product B')).toBeInTheDocument()
  })

})
