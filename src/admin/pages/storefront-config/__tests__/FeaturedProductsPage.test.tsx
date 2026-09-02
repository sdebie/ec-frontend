import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore.ts'
import {useFeaturedProducts} from '@/admin/pages/products/hooks/useFeaturedProducts'
import {FeaturedProductsPage} from '../FeaturedProductsPage.tsx'

const mockMutate = vi.fn()
const mockRefetch = vi.fn()

const mockFeaturedProducts = [
    {
        id: '1',
        name: 'Almond Butter',
        slug: 'almond-butter',
        sku: 'AB-001',
        status: 'ACTIVE',
        thumbnailUrl: 'https://example.com/almond.jpg',
        retailPrice: '12500',
        category: {id: 'cat-1', name: 'Spreads'},
    },
    {
        id: '2',
        name: 'Coconut Oil',
        slug: 'coconut-oil',
        sku: 'CO-002',
        status: 'PENDING',
        thumbnailUrl: null,
        retailPrice: '8900',
        category: {id: 'cat-2', name: 'Oils'},
    },
]

vi.mock('@/admin/pages/products/hooks/useFeaturedProducts', () => ({
    useFeaturedProducts: vi.fn(() => ({
        data: {featuredProductList: mockFeaturedProducts},
        isLoading: false,
        isError: false,
        error: null,
        refetch: mockRefetch,
    })),
}))

vi.mock('@/admin/pages/products/hooks/useSetProductFeatured', () => ({
    useSetProductFeatured: vi.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
}))

vi.mock('@/admin/pages/products/hooks/useAdminProductList', () => ({
    useAdminProductList: vi.fn(() => ({
        data: undefined,
        isLoading: false,
        refetch: vi.fn(),
    })),
}))

vi.mock('@/admin/context/BreadcrumbContext', () => ({
    useBreadcrumb: vi.fn(),
}))

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/storefront/featured-products']}>
            <FeaturedProductsPage/>
        </MemoryRouter>,
    )
}

describe('FeaturedProductsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useFeaturedProducts).mockReturnValue({
            data: {featuredProductList: mockFeaturedProducts},
            isLoading: false,
            isError: false,
            error: null,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useFeaturedProducts>)
        useAdminAuthStore.setState({
            isSignedIn: true,
            token: 'test-token',
            role: 'SUPER_ADMIN',
            authority: ['SUPER_ADMIN'],
            userName: 'Admin',
            email: 'admin@test.com',
            userId: '1',
        })
    })

    describe('data rendering', () => {
        it('renders featured products in the DataTable', () => {
            renderPage()
            expect(screen.getByText('Almond Butter')).toBeInTheDocument()
            expect(screen.getByText('Coconut Oil')).toBeInTheDocument()
        })

        it('renders the page title', () => {
            renderPage()
            expect(screen.getByRole('heading', {name: 'Featured Products'})).toBeInTheDocument()
        })
    })

    describe('Add button disabled at cap', () => {
        it('disables the Add button when 50 products are featured', () => {
            const fiftyProducts = Array.from({length: 50}, (_, i) => ({
                id: `id-${i}`,
                name: `Product ${String(i).padStart(2, '0')}`,
                slug: `product-${i}`,
                sku: `SKU-${i}`,
                status: 'ACTIVE',
                thumbnailUrl: null,
                retailPrice: '1000',
                category: {id: 'cat-1', name: 'General'},
            }))

            vi.mocked(useFeaturedProducts).mockReturnValue({
                data: {featuredProductList: fiftyProducts},
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useFeaturedProducts>)

            renderPage()

            const addButton = screen.getByRole('button', {name: /add featured product/i})
            expect(addButton).toBeDisabled()
        })

        it('enables the Add button when fewer than 50 products are featured', () => {
            renderPage()

            const addButton = screen.getByRole('button', {name: /add featured product/i})
            expect(addButton).not.toBeDisabled()
        })
    })

    describe('VIEWER role hides Add/Remove controls', () => {
        beforeEach(() => {
            useAdminAuthStore.setState({
                isSignedIn: true,
                token: 'test-token',
                role: 'VIEWER',
                authority: ['VIEWER'],
                userName: 'Viewer',
                email: 'viewer@test.com',
                userId: '2',
            })
        })

        it('hides the Add Featured Product button for VIEWER', () => {
            renderPage()
            expect(screen.queryByRole('button', {name: /add featured product/i})).not.toBeInTheDocument()
        })

        it('hides Remove buttons for VIEWER', () => {
            renderPage()
            expect(screen.queryByRole('button', {name: /remove/i})).not.toBeInTheDocument()
        })

        it('still renders product data for VIEWER', () => {
            renderPage()
            expect(screen.getByText('Almond Butter')).toBeInTheDocument()
            expect(screen.getByText('Coconut Oil')).toBeInTheDocument()
        })
    })

    describe('Remove triggers mutation', () => {
        it('calls setProductFeatured(id, false) when Remove is clicked', async () => {
            const user = userEvent.setup()
            renderPage()

            const removeButton = screen.getByRole('button', {
                name: /remove almond butter from featured/i,
            })
            await user.click(removeButton)

            expect(mockMutate).toHaveBeenCalledWith({productId: '1', featured: false})
        })
    })

    describe('error state', () => {
        beforeEach(() => {
            vi.mocked(useFeaturedProducts).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: new Error('Network error'),
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useFeaturedProducts>)
        })

        it('renders error state with Retry action on fetch failure', () => {
            renderPage()

            expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
            expect(screen.getByRole('button', {name: /retry/i})).toBeInTheDocument()
        })

        it('calls refetch when Retry is clicked', async () => {
            const user = userEvent.setup()
            renderPage()

            const retryButton = screen.getByRole('button', {name: /retry/i})
            await user.click(retryButton)

            expect(mockRefetch).toHaveBeenCalled()
        })
    })
})
