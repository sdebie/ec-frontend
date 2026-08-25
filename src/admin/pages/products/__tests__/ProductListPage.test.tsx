import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {useAdminProductList} from '../hooks/useAdminProductList'
import {useDeleteProductGql} from '../hooks/useDeleteProductGql'
import {useUpdateProductStatusGql} from '../hooks/useUpdateProductStatusGql'
import {useProductStats} from '../hooks/useProductStats'
import {useCategories} from '../hooks/useCategories'
import {useBrands} from '../hooks/useBrands'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {toast} from '@/shared/ui/components/toast'
import {ProductListPage} from '../ProductListPage'

const mockRefetch = vi.fn()
const mockDeleteMutate = vi.fn()
const mockStatusMutate = vi.fn()
const mockStatusMutateAsync = vi.fn().mockResolvedValue({})
const mockNavigate = vi.fn()

vi.mock('../hooks/useAdminProductList', () => ({
    useAdminProductList: vi.fn(),
}))
vi.mock('../hooks/useDeleteProductGql', () => ({
    useDeleteProductGql: vi.fn(),
}))
vi.mock('../hooks/useUpdateProductStatusGql', () => ({
    useUpdateProductStatusGql: vi.fn(),
}))
vi.mock('../hooks/useZeroProductStock', () => ({
    useZeroProductStock: vi.fn(() => ({mutate: vi.fn(), isPending: false})),
}))
vi.mock('../hooks/useProductStats', () => ({
    useProductStats: vi.fn(),
}))
vi.mock('../hooks/useCategories', () => ({
    useCategories: vi.fn(),
}))
vi.mock('../hooks/useBrands', () => ({
    useBrands: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => mockNavigate}
})
vi.mock('@/shared/ui/components/toast', () => ({
    toast: {success: vi.fn(), error: vi.fn()},
}))

const mockProducts = {
    content: [
        {
            id: '1',
            name: 'Test Product',
            slug: 'test-product',
            sku: 'SKU-001',
            category: {id: 'cat-1', name: 'Electronics'},
            status: 'ACTIVE',
            thumbnailUrl: null,
            retailPrice: '99.99',
            stockCount: 25,
            stockLevel: 'IN_STOCK',
        },
    ],
    totalElements: 1,
    totalPages: 1,
}

function setupDefaultMocks(overrides?: {
    useAdminProductListReturn?: Partial<ReturnType<typeof useAdminProductList>>
    role?: string
}) {
    vi.mocked(useAdminProductList).mockReturnValue({
        data: mockProducts,
        isLoading: false,
        refetch: mockRefetch,
        ...overrides?.useAdminProductListReturn,
    } as ReturnType<typeof useAdminProductList>)

    vi.mocked(useProductStats).mockReturnValue({
        data: {total: 10, active: 5, pending: 3, disabled: 2},
        isLoading: false,
        isError: false,
    })

    vi.mocked(useDeleteProductGql).mockReturnValue({
        mutate: mockDeleteMutate,
        isPending: false,
    } as unknown as ReturnType<typeof useDeleteProductGql>)

    vi.mocked(useUpdateProductStatusGql).mockReturnValue({
        mutate: mockStatusMutate,
        mutateAsync: mockStatusMutateAsync,
        isPending: false,
    } as unknown as ReturnType<typeof useUpdateProductStatusGql>)

    vi.mocked(useCategories).mockReturnValue({
        data: [{id: 'cat-1', name: 'Electronics'}],
        isLoading: false,
    })

    vi.mocked(useBrands).mockReturnValue({
        data: [{id: 'brand-1', name: 'Acme'}],
        isLoading: false,
    })

    useAdminAuthStore.setState({role: overrides?.role ?? 'SUPER_ADMIN'})
}

function renderPage() {
    return render(
        <MemoryRouter>
            <ProductListPage/>
        </MemoryRouter>,
    )
}

describe('ProductListPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('loading state', () => {
        it('renders DataTable skeleton when isLoading is true', () => {
            setupDefaultMocks({
                useAdminProductListReturn: {data: undefined, isLoading: true},
            })

            renderPage()

            const pulsingElements = document.querySelectorAll('.animate-pulse')
            expect(pulsingElements.length).toBeGreaterThan(0)
        })
    })

    describe('status filter reset', () => {
        it('resets pageIndex to 0 when status filter changes', () => {
            setupDefaultMocks()

            renderPage()

            // The status filter is the shared Select component (a button + listbox).
            // Scoped to role="option" — "Active" also appears as a status badge elsewhere in the table.
            fireEvent.click(screen.getByRole('button', {name: 'Filter by status'}))
            fireEvent.click(screen.getByRole('option', {name: 'Active'}))

            // After the filter change, useAdminProductList should be called with pageIndex=0
            const lastCall = vi.mocked(useAdminProductList).mock.calls.at(-1)
            expect(lastCall?.[0]).toMatchObject({pageIndex: 0})
        })
    })

    describe('row double-click', () => {
        it('navigates to the edit page when a row is double-clicked', () => {
            setupDefaultMocks()

            renderPage()

            fireEvent.doubleClick(screen.getByText('Test Product'))

            expect(mockNavigate).toHaveBeenCalledWith('/admin/products/1/edit')
        })

        it('double-clicking the Delete action opens the dialog instead of navigating', async () => {
            setupDefaultMocks()
            const user = userEvent.setup()

            renderPage()

            await user.dblClick(screen.getByTestId('action-delete'))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(mockNavigate).not.toHaveBeenCalled()
        })
    })

    describe('delete confirmation dialog', () => {
        it('opens ConfirmationDialog with product name when delete is clicked', () => {
            setupDefaultMocks()

            renderPage()

            // Delete is now an inline icon button in the Actions column
            fireEvent.click(screen.getByTestId('action-delete'))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText(/Delete "Test Product"\?/),
            ).toBeInTheDocument()
        })
    })

    /**
     * The dialog already tells staff, before they confirm, that a delete might
     * archive instead (see the description assertion above). The gap this
     * closes is what happens AFTER: deleteProduct used to return void, so the
     * success toast said "Product deleted successfully" unconditionally,
     * whichever actually happened. It now reads the outcome the mutation
     * resolves with and shows the matching message.
     */
    describe('delete outcome messaging', () => {
        async function confirmDelete() {
            const user = userEvent.setup()
            renderPage()

            await user.click(screen.getByTestId('action-delete'))
            await user.click(screen.getByRole('button', {name: 'Delete'}))

            expect(mockDeleteMutate).toHaveBeenCalledTimes(1)
            const [, callbacks] = mockDeleteMutate.mock.calls[0] as [
                unknown,
                {onSuccess: (data: {deleteProduct: 'DELETED' | 'ARCHIVED'}) => void},
            ]
            return callbacks
        }

        it('reports a permanent deletion when the server hard-deletes', async () => {
            setupDefaultMocks()

            const {onSuccess} = await confirmDelete()
            onSuccess({deleteProduct: 'DELETED'})

            expect(toast.success).toHaveBeenCalledWith('Product deleted permanently')
        })

        it('reports an archive, not a deletion, when the server archives instead', async () => {
            setupDefaultMocks()

            const {onSuccess} = await confirmDelete()
            onSuccess({deleteProduct: 'ARCHIVED'})

            expect(toast.success).toHaveBeenCalledWith(
                'Product archived instead of deleted, to preserve order history',
            )
            expect(toast.success).not.toHaveBeenCalledWith(expect.stringContaining('deleted permanently'))
        })
    })

    describe('VIEWER role', () => {
        it('hides Add Product button and mutating actions for VIEWER role', () => {
            setupDefaultMocks({role: 'VIEWER'})

            renderPage()

            expect(screen.queryByRole('button', {name: /add product/i})).not.toBeInTheDocument()
            expect(screen.queryByTestId('action-delete')).not.toBeInTheDocument()
            expect(screen.queryByTestId('action-out-of-stock')).not.toBeInTheDocument()
        })
    })

    describe('bulk status update', () => {
        it('shows the bulk bar when rows are selected and dispatches one update per product', async () => {
            setupDefaultMocks()

            renderPage()

            // No bar until something is selected
            expect(screen.queryByTestId('bulk-mark-active')).not.toBeInTheDocument()

            fireEvent.click(screen.getByLabelText('Select all rows'))
            expect(screen.getByText(/selected/)).toBeInTheDocument()

            fireEvent.click(screen.getByTestId('bulk-mark-active'))

            await waitFor(() => {
                expect(mockStatusMutateAsync).toHaveBeenCalledWith({id: '1', status: 'ACTIVE'})
            })

            // Selection clears after the batch completes
            await waitFor(() => {
                expect(screen.queryByTestId('bulk-mark-active')).not.toBeInTheDocument()
            })
        })

        it('Mark Inactive sends DISABLED for every selected product', async () => {
            setupDefaultMocks()

            renderPage()

            fireEvent.click(screen.getByLabelText('Select all rows'))
            fireEvent.click(screen.getByTestId('bulk-mark-inactive'))

            await waitFor(() => {
                expect(mockStatusMutateAsync).toHaveBeenCalledWith({id: '1', status: 'DISABLED'})
            })
        })
    })

    describe('ORDER_MANAGER role', () => {
        it('hides Add Product button and mutating actions for ORDER_MANAGER role', () => {
            setupDefaultMocks({role: 'ORDER_MANAGER'})

            renderPage()

            expect(screen.queryByRole('button', {name: /add product/i})).not.toBeInTheDocument()
            expect(screen.queryByTestId('action-delete')).not.toBeInTheDocument()
            expect(screen.queryByTestId('action-out-of-stock')).not.toBeInTheDocument()
        })
    })
})
