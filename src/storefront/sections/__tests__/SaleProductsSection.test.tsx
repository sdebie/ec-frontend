import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {SaleProductsSection} from '../SaleProductsSection.tsx'
import {useSaleShoppingProducts} from '@/storefront/sections/hooks/useSaleShoppingProducts'

// Mock the hook at the REAL import path used by the component.
// The component imports from '@/storefront/sections/hooks/useSaleShoppingProducts'.
// If this mock path doesn't match, tests will call the real hook and fail.
vi.mock('@/storefront/sections/hooks/useSaleShoppingProducts', () => ({
    useSaleShoppingProducts: vi.fn(),
}))

// Mock ProductCard to simplify assertions — just render a test-friendly stub.
vi.mock('@/storefront/catalog/components/ProductCard', () => ({
    ProductCard: ({product}: { product: { id: string; name: string } }) => (
        <div data-testid={`product-card-${product.id}`}>{product.name}</div>
    ),
}))

const mockedUseSaleShoppingProducts = vi.mocked(useSaleShoppingProducts)

const section = {
    id: 'sale-section-1',
    type: 'sale-products' as const,
    props: {
        title: 'Specials',
        limit: 4,
    },
}

const mockProducts = [
    {
        id: 'p1',
        name: 'Sale Product One',
        slug: 'sale-product-one',
        shortDescription: 'On sale now',
        images: [{id: 'img1', imageUrl: 'images/p1.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 199.99},
        wholesalePrice: null,
        retailSalePrice: {price: 149.99},
        wholesaleSalePrice: null,
        variantId: null,
    },
    {
        id: 'p2',
        name: 'Sale Product Two',
        slug: 'sale-product-two',
        shortDescription: 'Great deal',
        images: [{id: 'img2', imageUrl: 'images/p2.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 99.99},
        wholesalePrice: null,
        retailSalePrice: {price: 79.99},
        wholesaleSalePrice: null,
        variantId: null,
    },
]

function renderSection(sectionConfig = section) {
    return render(
        <MemoryRouter>
            <SaleProductsSection section={sectionConfig}/>
        </MemoryRouter>,
    )
}

describe('SaleProductsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Section frame', () => {
        it('renders inside a <section> with standardized rhythm classes', () => {
            mockedUseSaleShoppingProducts.mockReturnValue({
                products: mockProducts,
                isLoading: false,
                isError: false,
            })

            const {container} = renderSection()
            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-5xl', () => {
            mockedUseSaleShoppingProducts.mockReturnValue({
                products: mockProducts,
                isLoading: false,
                isError: false,
            })

            const {container} = renderSection()
            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-5xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold via SectionHeading', () => {
            mockedUseSaleShoppingProducts.mockReturnValue({
                products: mockProducts,
                isLoading: false,
                isError: false,
            })

            renderSection()
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Specials')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })
    })

    it('renders a row of ProductCards when products are returned', () => {
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: mockProducts,
            isLoading: false,
            isError: false,
        })

        renderSection()

        expect(screen.getByTestId('product-card-p1')).toBeInTheDocument()
        expect(screen.getByTestId('product-card-p2')).toBeInTheDocument()
        expect(screen.getByText('Sale Product One')).toBeInTheDocument()
        expect(screen.getByText('Sale Product Two')).toBeInTheDocument()
    })

    it('"View all" link navigates to /specials', () => {
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: mockProducts,
            isLoading: false,
            isError: false,
        })

        renderSection()

        const viewAllLink = screen.getByText(/View all/)
        expect(viewAllLink.closest('a')).toHaveAttribute('href', '/specials')
    })

    it('shows skeleton row while loading (isLoading: true)', () => {
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: [],
            isLoading: true,
            isError: false,
        })

        const {container} = renderSection()

        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons).toHaveLength(4) // Matches the limit prop
    })

    it('renders nothing (null) when product list is empty', () => {
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: [],
            isLoading: false,
            isError: false,
        })

        const {container} = renderSection()

        expect(container.innerHTML).toBe('')
    })

    it('renders nothing (null) when there is an error', () => {
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: [],
            isLoading: false,
            isError: true,
        })

        const {container} = renderSection()

        expect(container.innerHTML).toBe('')
    })

    it('mock intercepts the real import path used by the component', () => {
        // This test verifies that the vi.mock path matches the component's actual import.
        // If the hook import path in SaleProductsSection.tsx changes, this mock will
        // stop intercepting, the test will call the real hook, and it will fail due
        // to missing QueryClient/graphqlClient — proving the path must stay in sync.
        mockedUseSaleShoppingProducts.mockReturnValue({
            products: mockProducts,
            isLoading: false,
            isError: false,
        })

        renderSection()

        // If the mock isn't intercepting, useSaleShoppingProducts would throw
        // (missing QueryClientProvider). Reaching here confirms interception works.
        expect(mockedUseSaleShoppingProducts).toHaveBeenCalledWith({limit: 4})
    })
})
