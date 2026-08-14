import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { BrandCreatePage } from '../BrandCreatePage'

vi.mock('@/admin/pages/brands/hooks/useCreateBrand', () => ({
  useCreateBrand: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderBrandCreatePage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/products/brands/new']}>
        <Routes>
          <Route path="/admin/products/brands/new" element={<BrandCreatePage />} />
          <Route path="/admin/products/brands" element={<div>Brands List Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BrandCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects VIEWER to /admin/products/brands before rendering form', () => {
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'VIEWER',
      authority: [],
      userName: 'Viewer',
      email: 'viewer@test.com',
    })

    renderBrandCreatePage()

    expect(screen.getByText('Brands List Page')).toBeInTheDocument()
    expect(screen.queryByText('Create Brand')).not.toBeInTheDocument()
  })

  it('renders create form for SUPER_ADMIN', () => {
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'SUPER_ADMIN',
      authority: [],
      userName: 'Admin',
      email: 'admin@test.com',
    })

    renderBrandCreatePage()

    expect(screen.queryByText('Brands List Page')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Brand' })).toBeInTheDocument()
  })

  it('renders create form for CATALOG_MANAGER (brand:write admits it)', () => {
    useAdminAuthStore.setState({ role: 'CATALOG_MANAGER' })

    renderBrandCreatePage()

    expect(screen.queryByText('Brands List Page')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Brand' })).toBeInTheDocument()
  })
})
