import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {CategoryListPage} from '../CategoryListPage'
import {useCategoryList} from '@/admin/pages/categories/hooks/useCategoryList'

vi.mock('@/admin/pages/categories/hooks/useCategoryList', () => ({
    useCategoryList: vi.fn(),
}))

// CategoryListPage renders CategoryTable, which calls this hook itself.
vi.mock('@/admin/pages/categories/hooks/useDeleteCategory', () => ({
    useDeleteCategory: vi.fn(() => ({mutate: vi.fn(), isPending: false})),
}))

const mockedUseCategoryList = vi.mocked(useCategoryList)

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderCategoryListPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products/categories']}>
                <CategoryListPage/>
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
        it('renders column headers: Name, Main Category, Slug, Actions — Description is folded into Name', () => {
            // A category WITH a parent, so the Main Category cell shows a
            // parent name rather than the same "Main Category" text as the
            // header — otherwise getByText below would match two elements.
            mockedUseCategoryList.mockReturnValue({
                data: {
                    content: [
                        {
                            id: '2',
                            name: 'Laptops',
                            slug: 'laptops',
                            description: 'Tech stuff',
                            imageUrl: null,
                            parent: {id: '1', name: 'Electronics'}
                        },
                    ],
                    totalElements: 1,
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            expect(screen.getByRole('columnheader', {name: 'Name'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Main Category'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Slug'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Actions'})).toBeInTheDocument()
            expect(screen.queryByText('Description')).not.toBeInTheDocument()
        })

        it('renders parent name when category has a parent', () => {
            mockedUseCategoryList.mockReturnValue({
                data: {
                    content: [
                        {
                            id: '2',
                            name: 'Laptops',
                            slug: 'laptops',
                            description: null,
                            imageUrl: null,
                            parent: {id: '1', name: 'Electronics'}
                        },
                    ],
                    totalElements: 1,
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            expect(screen.getByText('Electronics')).toBeInTheDocument()
        })

        it('renders "Main Category" when category has no parent', () => {
            mockedUseCategoryList.mockReturnValue({
                data: {
                    content: [
                        {
                            id: '1',
                            name: 'Electronics',
                            slug: 'electronics',
                            description: 'Has a description',
                            imageUrl: null,
                            parent: null
                        },
                    ],
                    totalElements: 1,
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            // Appears twice: once as the column header, once as this row's
            // fallback since Electronics itself has no parent.
            expect(screen.getAllByText('Main Category')).toHaveLength(2)
        })
    })

    describe('RBAC — SUPER_ADMIN', () => {
        it('shows "New Category" button for SUPER_ADMIN', () => {
            mockedUseCategoryList.mockReturnValue({
                data: {content: [], totalElements: 0, totalPages: 0},
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            expect(screen.getByText('+ New Category')).toBeInTheDocument()
        })

        it('shows Edit and Delete action buttons for SUPER_ADMIN', () => {
            mockedUseCategoryList.mockReturnValue({
                data: {
                    content: [
                        {
                            id: '1',
                            name: 'Electronics',
                            slug: 'electronics',
                            description: null,
                            imageUrl: null,
                            parent: null
                        },
                    ],
                    totalElements: 1,
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
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
                data: {content: [], totalElements: 0, totalPages: 0},
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            expect(screen.queryByText('+ New Category')).not.toBeInTheDocument()
        })

        it('hides Edit and Delete action buttons for VIEWER', () => {
            mockedUseCategoryList.mockReturnValue({
                data: {
                    content: [
                        {
                            id: '1',
                            name: 'Electronics',
                            slug: 'electronics',
                            description: null,
                            imageUrl: null,
                            parent: null
                        },
                    ],
                    totalElements: 1,
                    totalPages: 1,
                },
                isLoading: false,
                error: null,
                sorting: [],
                onSortingChange: vi.fn(),
            })

            renderCategoryListPage()

            expect(screen.queryByLabelText('Edit Electronics')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Delete Electronics')).not.toBeInTheDocument()
        })
    })
})
