import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { BrandListPage } from '../BrandListPage'

vi.mock('@/admin/hooks/brands', () => ({
  useBrandList: vi.fn(),
  useDeleteBrand: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

import { useBrandList } from '@/admin/hooks/brands'

const mockedUseBrandList = vi.mocked(useBrandList)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderBrandListPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/products/brands']}>
        <BrandListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BrandListPage', () => {
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

  describe('Table columns', () => {
    it('renders column headers: Name, Slug, Actions — Description is folded into Name', () => {
      mockedUseBrandList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Nike', slug: 'nike', description: 'Sports brand', logoUrl: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Slug')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('renders brand data in the table, with description under the name or a placeholder when absent', () => {
      mockedUseBrandList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Nike', slug: 'nike', description: 'Sports brand', logoUrl: null },
            { id: '2', name: 'Adidas', slug: 'adidas', description: null, logoUrl: null },
          ],
          totalElements: 2,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.getByText('Nike')).toBeInTheDocument()
      expect(screen.getByText('nike')).toBeInTheDocument()
      expect(screen.getByText('Sports brand')).toBeInTheDocument()
      expect(screen.getByText('Adidas')).toBeInTheDocument()
      expect(screen.getByText('adidas')).toBeInTheDocument()
      expect(screen.getByText('No description for brand')).toBeInTheDocument()
    })
  })

  describe('RBAC — SUPER_ADMIN', () => {
    it('shows "New Brand" button for SUPER_ADMIN', () => {
      mockedUseBrandList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.getByText('+ New Brand')).toBeInTheDocument()
    })

    it('shows Edit and Delete action buttons for SUPER_ADMIN', () => {
      mockedUseBrandList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Nike', slug: 'nike', description: null, logoUrl: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.getByLabelText('Edit Nike')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Nike')).toBeInTheDocument()
    })
  })

  describe('RBAC — VIEWER', () => {
    beforeEach(() => {
      useAdminAuthStore.setState({
        isSignedIn: true,
        token: 'test-token',
        role: 'VIEWER',
        authority: [],
        userName: 'Viewer',
        email: 'viewer@test.com',
      })
    })

    it('hides "New Brand" button for VIEWER', () => {
      mockedUseBrandList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.queryByText('+ New Brand')).not.toBeInTheDocument()
    })

    it('hides Edit and Delete action buttons for VIEWER', () => {
      mockedUseBrandList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Nike', slug: 'nike', description: null, logoUrl: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(screen.queryByLabelText('Edit Nike')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Delete Nike')).not.toBeInTheDocument()
    })
  })
})
