import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {CategoryCreatePage} from '../CategoryCreatePage'

vi.mock('@/admin/pages/categories/hooks/useCreateCategory', () => ({
    useCreateCategory: vi.fn(() => ({mutate: vi.fn(), isPending: false})),
}))

// CategoryForm fetches the parent-category options through this hook.
vi.mock('@/admin/pages/categories/hooks/useCategoryList', () => ({
    useCategoryList: vi.fn(() => ({data: {content: []}, isLoading: false})),
}))

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderCategoryCreatePage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products/categories/new']}>
                <Routes>
                    <Route path="/admin/products/categories/new" element={<CategoryCreatePage/>}/>
                    <Route path="/admin/products/categories" element={<div>Categories List Page</div>}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    )
}

describe('CategoryCreatePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('redirects VIEWER to /admin/products/categories before rendering form', () => {
        useAdminAuthStore.setState({
            isSignedIn: true,
            token: 'test-token',
            role: 'VIEWER',
            authority: [],
            userName: 'Viewer',
            email: 'viewer@test.com',
        })

        renderCategoryCreatePage()

        expect(screen.getByText('Categories List Page')).toBeInTheDocument()
        expect(screen.queryByText('Create Category')).not.toBeInTheDocument()
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

        renderCategoryCreatePage()

        expect(screen.queryByText('Categories List Page')).not.toBeInTheDocument()
        // "Create Category" titles the card AND labels the submit button, so
        // target the button — it also proves the form is in create mode.
        expect(screen.getByRole('button', {name: 'Create Category'})).toBeInTheDocument()
    })
})
