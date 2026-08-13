import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {CategoryEditPage} from '../CategoryEditPage'
import {useCategoryDetail} from '@/admin/pages/categories/hooks/useCategoryDetail'

vi.mock('@/admin/pages/categories/hooks/useCategoryDetail', () => ({
    useCategoryDetail: vi.fn(),
}))

vi.mock('@/admin/pages/categories/hooks/useUpdateCategory', () => ({
    useUpdateCategory: vi.fn(() => ({mutate: vi.fn(), isPending: false})),
}))

// CategoryForm fetches the parent-category options through this hook.
vi.mock('@/admin/pages/categories/hooks/useCategoryList', () => ({
    useCategoryList: vi.fn(() => ({data: {content: []}, isLoading: false})),
}))

const mockedUseCategoryDetail = vi.mocked(useCategoryDetail)

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderCategoryEditPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products/categories/cat-1/edit']}>
                <Routes>
                    <Route path="/admin/products/categories/:categoryId/edit" element={<CategoryEditPage/>}/>
                    <Route path="/admin/products/categories" element={<div>Categories List Page</div>}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    )
}

describe('CategoryEditPage', () => {
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

    it('shows loading spinner while fetching category', () => {
        mockedUseCategoryDetail.mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        })

        renderCategoryEditPage()

        const spinner = document.querySelector('[class*="animate-spin"]')
        expect(spinner).toBeInTheDocument()
    })

    it('shows not-found message when category is null after loading', () => {
        mockedUseCategoryDetail.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })

        renderCategoryEditPage()

        expect(screen.getByText('Not Found')).toBeInTheDocument()
        expect(screen.getByText('Category not found')).toBeInTheDocument()
        expect(screen.getByText('Back to Categories')).toBeInTheDocument()
    })

    it('shows "Back to Categories" link pointing to /admin/products/categories', () => {
        mockedUseCategoryDetail.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })

        renderCategoryEditPage()

        const backLink = screen.getByText('Back to Categories')
        expect(backLink).toHaveAttribute('href', '/admin/products/categories')
    })

    it('redirects VIEWER to /admin/products/categories', () => {
        useAdminAuthStore.setState({
            isSignedIn: true,
            token: 'test-token',
            role: 'VIEWER',
            authority: [],
            userName: 'Viewer',
            email: 'viewer@test.com',
        })

        mockedUseCategoryDetail.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
        })

        renderCategoryEditPage()

        expect(screen.getByText('Categories List Page')).toBeInTheDocument()
    })

    it('passes editingCategoryId to CategoryForm when category is loaded', () => {
        mockedUseCategoryDetail.mockReturnValue({
            data: {
                id: 'cat-1',
                name: 'Electronics',
                slug: 'electronics',
                description: 'Tech items',
                imageUrl: null,
                parent: null,
            },
            isLoading: false,
            error: null,
        })

        renderCategoryEditPage()

        // The form renders with pre-filled values — verify form is rendered in edit mode
        expect(screen.getByText('Edit Category')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument()
        // The form input should have the pre-filled name value
        expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument()
    })
})
