import {describe, it, expect, vi, beforeEach} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {FeaturedProductsSectionConfig} from '@/shared/types/StorefrontConfig'

const mockRefetch = vi.fn()

const mockProducts = [
    {
        id: 'p1',
        name: 'Almond Butter',
        slug: 'almond-butter',
        shortDescription: 'Smooth almond butter',
        images: [{id: 'img1', imageUrl: 'https://example.com/almond.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 12500},
        wholesalePrice: {price: 10000},
        retailSalePrice: null,
        wholesaleSalePrice: null,
    },
    {
        id: 'p2',
        name: 'Coconut Oil',
        slug: 'coconut-oil',
        shortDescription: 'Pure coconut oil',
        images: [{id: 'img2', imageUrl: 'https://example.com/coconut.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 8900},
        wholesalePrice: null,
        retailSalePrice: {price: 7500},
        wholesaleSalePrice: null,
    },
]

vi.mock('@/storefront/hooks/useFeaturedShoppingProducts', () => ({
    useFeaturedShoppingProducts: vi.fn(() => ({
        products: mockProducts,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
    })),
}))

vi.mock('@/storefront/catalog/components/ProductCard', () => ({
    ProductCard: ({product}: { product: { id: string; name: string } }) => (
        <div data-testid={`product-card-${product.id}`}>{product.name}</div>
    ),
}))

import {useFeaturedShoppingProducts} from '@/storefront/hooks/useFeaturedShoppingProducts'
import {FeaturedProductsSection} from './FeaturedProductsSection'

const defaultSection: FeaturedProductsSectionConfig = {
    id: 'section-1',
    type: 'featured-products',
    props: {
        title: 'Featured Products',
        category: undefined,
        limit: 4,
    },
}

describe('FeaturedProductsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
            products: mockProducts,
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        })
    })

    describe('renders ProductCard for each product', () => {
        it('renders a ProductCard for each returned product', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByTestId('product-card-p1')).toBeInTheDocument()
            expect(screen.getByTestId('product-card-p2')).toBeInTheDocument()
            expect(screen.getByText('Almond Butter')).toBeInTheDocument()
            expect(screen.getByText('Coconut Oil')).toBeInTheDocument()
        })

        it('renders the section title', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByRole('heading', {name: 'Featured Products'})).toBeInTheDocument()
        })

        it('passes correct params to the hook', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(useFeaturedShoppingProducts).toHaveBeenCalledWith({
                limit: 4,
                categorySlug: undefined,
            })
        })
    })

    describe('empty state', () => {
        it('returns null when no products are returned', () => {
            vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
                products: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const {container} = render(<FeaturedProductsSection section={defaultSection}/>)

            expect(container.innerHTML).toBe('')
        })
    })

    describe('loading state', () => {
        it('shows skeleton placeholders while loading', () => {
            vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
                products: [],
                isLoading: true,
                isError: false,
                refetch: mockRefetch,
            })

            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByRole('heading', {name: 'Featured Products'})).toBeInTheDocument()
            const skeletons = document.querySelectorAll('.animate-pulse')
            expect(skeletons.length).toBe(4)
        })

        it('skeleton count matches the configured limit', () => {
            vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
                products: [],
                isLoading: true,
                isError: false,
                refetch: mockRefetch,
            })

            const sectionWithLimit: FeaturedProductsSectionConfig = {
                ...defaultSection,
                props: {...defaultSection.props, limit: 6},
            }

            render(<FeaturedProductsSection section={sectionWithLimit}/>)

            const skeletons = document.querySelectorAll('.animate-pulse')
            expect(skeletons.length).toBe(6)
        })

        it('defaults to 8 skeletons when limit is not set', () => {
            vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
                products: [],
                isLoading: true,
                isError: false,
                refetch: mockRefetch,
            })

            const sectionNoLimit: FeaturedProductsSectionConfig = {
                id: 'section-1',
                type: 'featured-products',
                props: {title: 'Featured Products'},
            }

            render(<FeaturedProductsSection section={sectionNoLimit}/>)

            const skeletons = document.querySelectorAll('.animate-pulse')
            expect(skeletons.length).toBe(8)
        })
    })

    describe('error state', () => {
        beforeEach(() => {
            vi.mocked(useFeaturedShoppingProducts).mockReturnValue({
                products: [],
                isLoading: false,
                isError: true,
                refetch: mockRefetch,
            })
        })

        it('shows error message when query fails', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
        })

        it('shows a Try again button', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByRole('button', {name: /try again/i})).toBeInTheDocument()
        })

        it('calls refetch when Try again is clicked', async () => {
            const user = userEvent.setup()
            render(<FeaturedProductsSection section={defaultSection}/>)

            const retryButton = screen.getByRole('button', {name: /try again/i})
            await user.click(retryButton)

            expect(mockRefetch).toHaveBeenCalled()
        })

        it('still shows the section title in the error state', () => {
            render(<FeaturedProductsSection section={defaultSection}/>)

            expect(screen.getByRole('heading', {name: 'Featured Products'})).toBeInTheDocument()
        })
    })
})
