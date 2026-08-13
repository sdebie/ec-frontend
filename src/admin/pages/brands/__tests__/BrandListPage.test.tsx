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

function renderBrandListPage(initialPath = '/admin/products/brands') {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
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

  describe('page/sort/search restored from the URL', () => {
    // This is the actual fix for "closing the edit/create form sends me back
    // to page 1" — BrandListPage reads its table state from the URL instead
    // of component state, and navigate(-1) from the form lands back on the
    // exact URL (page/sort/search and all) the user came from.
    it('requests the page, sort, and search encoded in the URL on mount, not page 1', () => {
      mockedUseBrandList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 3 },
        isLoading: false,
        error: null,
      })

      renderBrandListPage('/admin/products/brands?page=2&sortBy=name&sortDir=desc&q=nike')

      expect(mockedUseBrandList).toHaveBeenCalledWith(
        expect.objectContaining({
          pageIndex: 2,
          search: 'nike',
          sort: [{ field: 'name', direction: 'DESC' }],
        }),
      )
    })

    it('the search box shows the restored search term instead of an empty box silently filtering', () => {
      mockedUseBrandList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 1 },
        isLoading: false,
        error: null,
      })

      renderBrandListPage('/admin/products/brands?q=nike')

      expect(screen.getByPlaceholderText('Search brands by name...')).toHaveValue('nike')
    })

    it('defaults to page 0 with no sort when the URL carries no table state', () => {
      mockedUseBrandList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 1 },
        isLoading: false,
        error: null,
      })

      renderBrandListPage()

      expect(mockedUseBrandList).toHaveBeenCalledWith(
        expect.objectContaining({ pageIndex: 0, search: '', sort: undefined }),
      )
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
