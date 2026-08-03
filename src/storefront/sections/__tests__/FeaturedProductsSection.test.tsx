import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {FeaturedProductsSectionConfig, StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {FeaturedProductsSection} from '../FeaturedProductsSection'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'

// ResizeObserver is not available in jsdom — the Carousel layout needs it
let originalResizeObserver: typeof ResizeObserver
beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver
    globalThis.ResizeObserver = class MockResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof ResizeObserver
})
afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver
})

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

    describe('carouselControls display hint', () => {
        it('default (no hint) renders header-controls mode when layout is carousel', async () => {
            mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

            renderComponent({
                ...section,
                props: {...section.props, layout: 'carousel'},
            })

            await waitFor(() => {
                expect(screen.getByText('Product One')).toBeInTheDocument()
            })

            // Header-controls mode: Carousel renders a region; the heading is INSIDE it
            const region = screen.getByRole('region', {name: 'Featured Products'})
            expect(region).toBeInTheDocument()
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Featured Products')
            // In header mode the heading is a child of the region element
            expect(region.contains(heading)).toBe(true)
        })

        it('carouselControls="overlay" renders arrowPlacement mode (heading outside carousel)', async () => {
            mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

            renderComponent({
                ...section,
                props: {...section.props, layout: 'carousel', carouselControls: 'overlay'},
            })

            await waitFor(() => {
                expect(screen.getByText('Product One')).toBeInTheDocument()
            })

            // Overlay mode: SectionHeading is rendered OUTSIDE the carousel region
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Featured Products')
            const region = screen.getByRole('region', {name: 'Featured Products'})
            expect(region.contains(heading)).toBe(false)
        })

        it('carouselControls="gutter" renders arrowPlacement mode (heading outside carousel)', async () => {
            mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

            renderComponent({
                ...section,
                props: {...section.props, layout: 'carousel', carouselControls: 'gutter'},
            })

            await waitFor(() => {
                expect(screen.getByText('Product One')).toBeInTheDocument()
            })

            // Gutter mode: SectionHeading is rendered OUTSIDE the carousel region
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Featured Products')
            const region = screen.getByRole('region', {name: 'Featured Products'})
            expect(region.contains(heading)).toBe(false)
        })

        it('unknown carouselControls value falls back to header-controls (default)', async () => {
            mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

            renderComponent({
                ...section,
                props: {...section.props, layout: 'carousel', carouselControls: 'bogus' as 'header'},
            })

            await waitFor(() => {
                expect(screen.getByText('Product One')).toBeInTheDocument()
            })

            // Falls back to header-controls mode — heading is inside the region
            const region = screen.getByRole('region', {name: 'Featured Products'})
            expect(region).toBeInTheDocument()
            const heading = screen.getByRole('heading', {level: 2})
            expect(region.contains(heading)).toBe(true)
        })
    })

    describe('Section frame', () => {
        it('renders inside a <section> with standardized rhythm classes', () => {
            mockedRequest.mockReturnValue(new Promise(() => {}))

            const {container} = renderComponent()
            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-6xl', () => {
            mockedRequest.mockReturnValue(new Promise(() => {}))

            const {container} = renderComponent()
            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-6xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold via SectionHeading', () => {
            mockedRequest.mockReturnValue(new Promise(() => {}))

            renderComponent()
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Featured Products')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })
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

    it('renders products in the shared Carousel when layout is carousel', async () => {
        mockedRequest.mockResolvedValueOnce(resolve(mockProducts))

        const {container} = renderComponent({
            ...section,
            props: {...section.props, layout: 'carousel'},
        })

        await waitFor(() => {
            expect(screen.getByText('Product One')).toBeInTheDocument()
        })

        // Carousel region with snap cells replaces the free-scroll strip
        expect(screen.getByRole('region', {name: 'Featured Products'})).toBeInTheDocument()
        expect(container.querySelectorAll('.snap-start')).toHaveLength(2)
        expect(container.querySelector('.w-56')).not.toBeInTheDocument()
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

        // Each ProductCard renders discrete image + title links to the product detail
        // page. The mock data is VARIABLE (no variantId), so each card also gets a
        // "Select options" link AND the wishlist heart as a link — with no variant to
        // save, the heart routes to the PDP to choose one.
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(8) // 2 products × 4 (image + wishlist + title + Select options)
        expect(links.slice(0, 4).map((l) => l.getAttribute('href')))
            .toEqual(Array(4).fill('/products/product-one'))
        expect(links.slice(4).map((l) => l.getAttribute('href')))
            .toEqual(Array(4).fill('/products/product-two'))

        // The heart must announce why it navigates instead of saving.
        expect(screen.getAllByLabelText('Choose options to save to wishlist')).toHaveLength(2)
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
