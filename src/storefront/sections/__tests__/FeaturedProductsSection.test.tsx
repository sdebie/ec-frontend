import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context.ts'
import type {FeaturedProductsSectionConfig, StorefrontConfig} from '@/shared/types/StorefrontConfig.ts'
import {FeaturedProductsSection} from '../FeaturedProductsSection.tsx'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient.ts'

// The section fetches via useFeaturedShoppingProducts, which calls
// graphqlClient.request(SHOPPING_FEATURED_PRODUCT_LIST). Mock at that boundary.
vi.mock('@/shared/api/graphql/graphqlClient', () => ({
    graphqlClient: {
        request: vi.fn(),
    },
}))

const mockedRequest = vi.mocked(graphqlClient.request)

const section: FeaturedProductsSectionConfig = {
    id: 'featured-1',
    type: 'featured-products',
    props: {
        title: 'Featured Products',
        limit: 3,
    },
}

// FeaturedProduct wire shape returned by shoppingFeaturedProductList.
const mockProducts = [
    {
        id: '1',
        name: 'Product One',
        slug: 'product-one',
        shortDescription: 'A great product',
        images: [{imageUrl: 'images/p1.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 299.99},
        wholesalePrice: null,
        retailSalePrice: null,
        wholesaleSalePrice: null,
    },
    {
        id: '2',
        name: 'Product Two',
        slug: 'product-two',
        shortDescription: '',
        images: [{imageUrl: 'images/p2.jpg', featured: true, sortOrder: 0}],
        retailPrice: {price: 149.5},
        wholesalePrice: null,
        retailSalePrice: null,
        wholesaleSalePrice: null,
    },
]

function resolve(products: typeof mockProducts) {
    return {shoppingFeaturedProductList: products}
}

const storefrontConfig: StorefrontConfig = {
    branding: {
        name: 'Test Store',
    },
    clientId: 'test-client',
    clientName: 'Test Store',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [],
    sections: [],
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
}

function renderComponent(sectionConfig: FeaturedProductsSectionConfig = section) {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <StorefrontConfigContext.Provider value={storefrontConfig}>
                <MemoryRouter>
                    <FeaturedProductsSection section={sectionConfig}/>
                </MemoryRouter>
            </StorefrontConfigContext.Provider>
        </QueryClientProvider>,
    )
}

describe('FeaturedProductsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders skeleton cards matching limit count during loading state', () => {
        mockedRequest.mockReturnValue(new Promise(() => {
        })) // Never resolves — stays in loading

        const {container} = renderComponent()

        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons).toHaveLength(3)
    })

    it('renders error message and "Try again" button on fetch error', async () => {
        mockedRequest.mockRejectedValueOnce(new Error('Network error'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Failed to load featured products.')).toBeInTheDocument()
        })

        expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
    })

    it('clicking "Try again" triggers refetch', async () => {
        mockedRequest.mockRejectedValueOnce(new Error('Network error'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
        })

        mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', {name: 'Try again'}))

        await waitFor(() => {
            expect(mockedRequest).toHaveBeenCalledTimes(2)
        })
    })

    it('renders nothing when the list is empty', async () => {
        mockedRequest.mockResolvedValueOnce(resolve([]))

        const {container} = renderComponent()

        // Empty result → the section renders null (no title, no section element).
        await waitFor(() => {
            expect(mockedRequest).toHaveBeenCalled()
        })
        await waitFor(() => {
            expect(screen.queryByText('Featured Products')).not.toBeInTheDocument()
        })
        expect(container.querySelector('section')).toBeNull()
    })

    it('renders product names, formatted prices, and links to /products/{slug}', async () => {
        mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Product One')).toBeInTheDocument()
        })

        expect(screen.getByText('Product Two')).toBeInTheDocument()

        // ZAR / en-ZA formatting — prices contain the currency symbol.
        const priceElements = screen.getAllByText(/R/)
        expect(priceElements.length).toBeGreaterThanOrEqual(2)

        // Each ProductCard is itself a link to the product detail page.
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveAttribute('href', '/products/product-one')
        expect(links[1]).toHaveAttribute('href', '/products/product-two')
    })

    it('renders product images with loading="lazy" and alt set to product name', async () => {
        mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByAltText('Product One')).toBeInTheDocument()
        })

        const img1 = screen.getByAltText('Product One')
        expect(img1).toHaveAttribute('loading', 'lazy')
        expect(img1.getAttribute('src')).toContain('p1.jpg')

        const img2 = screen.getByAltText('Product Two')
        expect(img2).toHaveAttribute('loading', 'lazy')
        expect(img2.getAttribute('src')).toContain('p2.jpg')
    })
})
