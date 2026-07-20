import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { BrandEditPage } from '../BrandEditPage'

vi.mock('@/admin/hooks/brands', () => ({
  useBrandDetail: vi.fn(),
  useUpdateBrand: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

import { useBrandDetail } from '@/admin/hooks/brands'

const mockedUseBrandDetail = vi.mocked(useBrandDetail)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderBrandEditPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/products/brands/brand-1/edit']}>
        <Routes>
          <Route path="/admin/products/brands/:brandId/edit" element={<BrandEditPage />} />
          <Route path="/admin/products/brands" element={<div>Brands List Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BrandEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'SUPER_ADMIN',
      authority: [],
      userName: 'Admin',
      email: 'admin@test.com',
    })
  })

  it('shows loading spinner while fetching brand', () => {
    mockedUseBrandDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    renderBrandEditPage()

    // PageLoadingSpinner renders a loading indicator
    const spinner = document.querySelector('[class*="animate-spin"]')
    expect(spinner).toBeInTheDocument()
  })

  it('shows not-found message when brand is null after loading', () => {
    mockedUseBrandDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderBrandEditPage()

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Brand not found')).toBeInTheDocument()
    expect(screen.getByText('Back to Brands')).toBeInTheDocument()
  })

  it('shows "Back to Brands" link pointing to /admin/products/brands', () => {
    mockedUseBrandDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderBrandEditPage()

    const backLink = screen.getByText('Back to Brands')
    expect(backLink).toHaveAttribute('href', '/admin/products/brands')
  })

  it('redirects VIEWER to /admin/products/brands', () => {
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'VIEWER',
      authority: [],
      userName: 'Viewer',
      email: 'viewer@test.com',
    })

    mockedUseBrandDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    })

    renderBrandEditPage()

    expect(screen.getByText('Brands List Page')).toBeInTheDocument()
  })
})
