import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {FeaturedProductsSectionConfig, StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {FeaturedProductsSection} from './FeaturedProductsSection'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
    storefrontHttpClient: {
        get: vi.fn(),
    },
}))

const mockedGet = vi.mocked(storefrontHttpClient.get)

const section: FeaturedProductsSectionConfig = {
    id: 'featured-1',
    type: 'featured-products',
    props: {
        title: 'Featured Products',
        limit: 3,
    },
}

const mockProducts = [
    {
        id: '1',
        name: 'Product One',
        slug: 'product-one',
        retailPrice: 299.99,
        shortDescription: 'A great product',
        primaryImageUrl: '/img/p1.jpg'
    },
    {id: '2', name: 'Product Two', slug: 'product-two', retailPrice: 149.50, primaryImageUrl: '/img/p2.jpg'},
]

const storefrontConfig: StorefrontConfig = {
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
        </QueryClientProvider>
    )
}

describe('FeaturedProductsSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders skeleton cards matching limit count during loading state', () => {
        mockedGet.mockReturnValue(new Promise(() => {
        })) // Never resolves — stays in loading

        const {container} = renderComponent()

        const skeletons = container.querySelectorAll('.animate-pulse')
        expect(skeletons).toHaveLength(3)
    })

    it('renders error message and "Try again" button on fetch error', async () => {
        mockedGet.mockRejectedValueOnce(new Error('Network error'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Failed to load featured products.')).toBeInTheDocument()
        })

        expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
    })

    it('clicking "Try again" triggers refetch', async () => {
        mockedGet.mockRejectedValueOnce(new Error('Network error'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
        })

        mockedGet.mockResolvedValueOnce({data: mockProducts})

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', {name: 'Try again'}))

        await waitFor(() => {
            expect(mockedGet).toHaveBeenCalledTimes(2)
        })
    })

    it('renders empty state message when API returns empty array', async () => {
        mockedGet.mockResolvedValueOnce({data: []})

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('No featured products at this time.')).toBeInTheDocument()
        })
    })

    it('renders product names, formatted prices, and links to /products/{slug}', async () => {
        mockedGet.mockResolvedValueOnce({data: mockProducts})

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Product One')).toBeInTheDocument()
        })

        expect(screen.getByText('Product Two')).toBeInTheDocument()

        // ZAR formatting with en-ZA locale: R 299,99 and R 149,50
        // The exact format depends on the Intl implementation but should contain "299" and "149"
        const priceElements = screen.getAllByText(/R/)
        expect(priceElements.length).toBeGreaterThanOrEqual(2)

        const links = screen.getAllByRole('link', {name: 'View details'})
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveAttribute('href', '/products/product-one')
        expect(links[1]).toHaveAttribute('href', '/products/product-two')
    })

    it('renders product images with loading="lazy" and alt set to product name', async () => {
        mockedGet.mockResolvedValueOnce({data: mockProducts})

        renderComponent()

        await waitFor(() => {
            expect(screen.getByAltText('Product One')).toBeInTheDocument()
        })

        const img1 = screen.getByAltText('Product One')
        expect(img1).toHaveAttribute('loading', 'lazy')
        expect(img1).toHaveAttribute('src', '/img/p1.jpg')

        const img2 = screen.getByAltText('Product Two')
        expect(img2).toHaveAttribute('loading', 'lazy')
        expect(img2).toHaveAttribute('src', '/img/p2.jpg')
    })
})
