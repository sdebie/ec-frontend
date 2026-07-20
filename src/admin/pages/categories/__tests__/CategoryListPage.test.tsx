import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { CategoryListPage } from '../CategoryListPage'

vi.mock('@/admin/hooks/categories', () => ({
  useCategoryList: vi.fn(),
  useDeleteCategory: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

import { useCategoryList } from '@/admin/hooks/categories'

const mockedUseCategoryList = vi.mocked(useCategoryList)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderCategoryListPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/products/categories']}>
        <CategoryListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CategoryListPage', () => {
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
    it('renders column headers: Name, Slug, Parent, Description, Actions', () => {
      mockedUseCategoryList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Electronics', slug: 'electronics', description: 'Tech stuff', imageUrl: null, parent: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Slug')).toBeInTheDocument()
      expect(screen.getByText('Parent')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders parent name when category has a parent', () => {
      mockedUseCategoryList.mockReturnValue({
        data: {
          content: [
            { id: '2', name: 'Laptops', slug: 'laptops', description: null, imageUrl: null, parent: { id: '1', name: 'Electronics' } },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.getByText('Electronics')).toBeInTheDocument()
    })

    it('renders "—" when category has no parent', () => {
      mockedUseCategoryList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Electronics', slug: 'electronics', description: 'Has a description', imageUrl: null, parent: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      // With a description provided, the only "—" in the row comes from the Parent column
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('RBAC — SUPER_ADMIN', () => {
    it('shows "New Category" button for SUPER_ADMIN', () => {
      mockedUseCategoryList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.getByText('+ New Category')).toBeInTheDocument()
    })

    it('shows Edit and Delete action buttons for SUPER_ADMIN', () => {
      mockedUseCategoryList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Electronics', slug: 'electronics', description: null, imageUrl: null, parent: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.getByLabelText('Edit Electronics')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Electronics')).toBeInTheDocument()
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

    it('hides "New Category" button for VIEWER', () => {
      mockedUseCategoryList.mockReturnValue({
        data: { content: [], totalElements: 0, totalPages: 0 },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.queryByText('+ New Category')).not.toBeInTheDocument()
    })

    it('hides Edit and Delete action buttons for VIEWER', () => {
      mockedUseCategoryList.mockReturnValue({
        data: {
          content: [
            { id: '1', name: 'Electronics', slug: 'electronics', description: null, imageUrl: null, parent: null },
          ],
          totalElements: 1,
          totalPages: 1,
        },
        isLoading: false,
        error: null,
      })

      renderCategoryListPage()

      expect(screen.queryByLabelText('Edit Electronics')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Delete Electronics')).not.toBeInTheDocument()
    })
  })
})
