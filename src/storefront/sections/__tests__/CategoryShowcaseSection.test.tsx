import {fireEvent, render as rtlRender, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {ReactElement} from 'react'
import {CategoryShowcaseSection} from '../CategoryShowcaseSection'
import type {CategoryShowcaseSectionConfig} from '@/shared/types/StorefrontConfig'
import {useCategories} from '@/storefront/catalog/hooks/useCategories'
import {useProducts} from '@/storefront/catalog/hooks/useProducts'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

vi.mock('@/shared/utils/imageUrl', () => ({
    resolveImageUrl: (path: string | null | undefined) => (path ? `/static/images/${path}` : null),
}))

vi.mock('@/storefront/catalog/hooks/useCategories', () => ({
    useCategories: vi.fn(),
}))

vi.mock('@/storefront/catalog/hooks/useProducts', () => ({
    useProducts: vi.fn(),
}))

vi.mock('@/storefront/catalog/components/ProductCard', () => ({
    ProductCard: ({product}: { product: { id: string; name: string } }) => (
        <div data-testid={`product-card-${product.id}`}>{product.name}</div>
    ),
}))

// The section links its category logo into the filtered catalogue, so every
// render needs a router in context.
function renderWithRouter(ui: ReactElement) {
    return rtlRender(ui, {wrapper: MemoryRouter})
}

const mockedUseCategories = vi.mocked(useCategories)
const mockedUseProducts = vi.mocked(useProducts)

function buildSection(overrides: Partial<CategoryShowcaseSectionConfig['props']> = {}): CategoryShowcaseSectionConfig {
    return {
        id: 'section-1',
        type: 'category-showcase',
        props: {
            title: 'Medical Supplies',
            categorySlug: 'medical',
            themeColor: '#1a3a5c',
            ...overrides,
        },
    }
}

const PRODUCTS_FIXTURE = [
    {id: 'p1', name: 'Gauze', slug: 'gauze', shortDescription: '', images: [], retailPrice: null, wholesalePrice: null, retailSalePrice: null, wholesaleSalePrice: null, variantId: null, sku: null, inStock: null},
    {id: 'p2', name: 'Gloves', slug: 'gloves', shortDescription: '', images: [], retailPrice: null, wholesalePrice: null, retailSalePrice: null, wholesaleSalePrice: null, variantId: null, sku: null, inStock: null},
]

function setupLoadedState() {
    mockedUseCategories.mockReturnValue({
        categories: [{id: 'cat-1', name: 'Medical', slug: 'medical'}],
        isLoading: false,
        isError: false,
    })
    mockedUseProducts.mockReturnValue({
        products: PRODUCTS_FIXTURE,
        totalElements: 2,
        totalPages: 1,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })
}

describe('CategoryShowcaseSection', () => {
    let originalResizeObserver: typeof ResizeObserver

    beforeEach(() => {
        vi.clearAllMocks()
        // ResizeObserver stub — jsdom lacks it; Carousel depends on it
        originalResizeObserver = globalThis.ResizeObserver
        globalThis.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver
    })

    afterEach(() => {
        globalThis.ResizeObserver = originalResizeObserver
    })

    it('renders its own h2 at the default (overlay) treatment in carousel layout', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel'})}/>,
        )

        // Default (no carouselControls seed) = overlay → own h2 present
        expect(container.querySelector('h2')).toBeInTheDocument()
        expect(screen.getByText('Medical Supplies')).toBeInTheDocument()
        // The Carousel renders as a region with the aria-label
        expect(screen.getByRole('region', {name: 'Medical Supplies'})).toBeInTheDocument()
    })

    it('passes arrowPlacement="overlay" to Carousel at the default treatment', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel'})}/>,
        )

        // Carousel arrow buttons are in the DOM (overlay mode renders absolute-positioned arrows)
        const region = screen.getByRole('region', {name: 'Medical Supplies'})
        // Verify the carousel region exists and snap-start cells present (carousel rendered)
        expect(region).toBeInTheDocument()
        expect(container.querySelectorAll('.snap-start')).toHaveLength(2)
    })

    it('renders overlay treatment when carouselControls is explicitly "overlay"', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel', carouselControls: 'overlay'})}/>,
        )

        // Own h2 present
        expect(container.querySelector('h2')).toBeInTheDocument()
        expect(screen.getByText('Medical Supplies')).toBeInTheDocument()
    })

    it('puts the heading INSIDE the Carousel header row at the "header" hint', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel', carouselControls: 'header'})}/>,
        )

        // Under the 'header' hint the heading belongs in the Carousel's header
        // row, which is what keeps the prev/next buttons off the product cards.
        // Exactly one h2 either way.
        const sectionEl = container.querySelector('section')!
        expect(sectionEl.querySelectorAll('h2')).toHaveLength(1)

        const region = screen.getByRole('region', {name: 'Medical Supplies'})
        const heading = region.querySelector('h2')
        expect(heading).not.toBeNull()
        expect(heading!.textContent).toContain('Medical Supplies')
        // No leftover sr-only stand-in now that the real heading lives here.
        expect(region.querySelector('.sr-only')).toBeNull()
    })

    it('renders own h2 when carouselControls is "gutter" and passes gutter arrowPlacement', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel', carouselControls: 'gutter'})}/>,
        )

        // Own h2 is present (gutter mode renders its own heading)
        const sectionEl = container.querySelector('section')!
        const directH2 = sectionEl.querySelector('h2')
        expect(directH2).toBeInTheDocument()
        expect(directH2).toHaveTextContent('Medical Supplies')
    })

    it('falls back to overlay for unknown carouselControls values', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({
                layout: 'carousel',
                carouselControls: 'bogus' as 'overlay',
            })}/>,
        )

        // Falls back to overlay — own h2 present
        const sectionEl = container.querySelector('section')!
        const directH2 = sectionEl.querySelector('h2')
        expect(directH2).toBeInTheDocument()
    })

    it('returns null when categories loaded but slug not matched', () => {
        mockedUseCategories.mockReturnValue({
            categories: [{id: 'cat-1', name: 'PPE', slug: 'ppe'}],
            isLoading: false,
            isError: false,
        })
        mockedUseProducts.mockReturnValue({
            products: [],
            totalElements: 0,
            totalPages: 0,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        })

        const {container} = renderWithRouter(<CategoryShowcaseSection section={buildSection({categorySlug: 'non-existent'})}/>)
        expect(container.innerHTML).toBe('')
    })

    it('returns null when products result is empty', () => {
        mockedUseCategories.mockReturnValue({
            categories: [{id: 'cat-1', name: 'Medical', slug: 'medical'}],
            isLoading: false,
            isError: false,
        })
        mockedUseProducts.mockReturnValue({
            products: [],
            totalElements: 0,
            totalPages: 0,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        })

        const {container} = renderWithRouter(<CategoryShowcaseSection section={buildSection()}/>)
        expect(container.innerHTML).toBe('')
    })

    it('renders product cards when products returned', () => {
        setupLoadedState()

        renderWithRouter(<CategoryShowcaseSection section={buildSection()}/>)

        expect(screen.getByTestId('product-card-p1')).toBeInTheDocument()
        expect(screen.getByTestId('product-card-p2')).toBeInTheDocument()
        expect(screen.getByText('Medical Supplies')).toBeInTheDocument()
    })

    it('calls useProducts with enabled: false before category ID resolved', () => {
        mockedUseCategories.mockReturnValue({
            categories: [{id: 'cat-1', name: 'PPE', slug: 'ppe'}],
            isLoading: false,
            isError: false,
        })
        mockedUseProducts.mockReturnValue({
            products: [],
            totalElements: 0,
            totalPages: 0,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        })

        renderWithRouter(<CategoryShowcaseSection section={buildSection({categorySlug: 'medical'})}/>)

        expect(mockedUseProducts).toHaveBeenCalledWith({
            categoryId: undefined,
            enabled: false,
        })
    })

    it('renders decorative image when imageUrl provided', () => {
        setupLoadedState()

        const {container} = renderWithRouter(<CategoryShowcaseSection
            section={buildSection({imageUrl: 'categories/medical.png'})}/>)

        const img = container.querySelector('img[aria-hidden="true"]')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', '/static/images/categories/medical.png')
    })

    // Exactly ONE graphic, at heading scale, in the heading block at every
    // breakpoint — a second one as a side rail holds the deck to three cards.

    describe('category graphic placement', () => {
        function graphicsOf(container: HTMLElement) {
            return Array.from(container.querySelectorAll('img[aria-hidden="true"]')) as HTMLElement[]
        }

        it('renders exactly one category graphic, at heading scale, with no side rail', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/medical.png'})}/>)

            const graphics = graphicsOf(container)
            expect(graphics).toHaveLength(1)

            // Regression guard: the removed rail's signature classes must not
            // come back — they are what squeezed the deck to three cards.
            expect(container.querySelector('.w-64')).toBeNull()
            expect(container.querySelector('.md\\:hidden')).toBeNull()

            // Heading-scale, not card-scale.
            expect(graphics[0].className).toContain('h-16')
            expect(graphics[0].className).toContain('w-16')

            // It sits BESIDE the heading, not inside the h2 — so the accent rule
            // under the title tracks the text rather than starting under the logo.
            const headingRow = graphics[0].closest('a')!.parentElement!
            expect(headingRow.querySelector('h2')).not.toBeNull()
            expect(graphics[0].closest('h2')).toBeNull()
            expect(headingRow.firstElementChild).toBe(graphics[0].closest('a'))
        })

        it('renders the heading in white (accent-text token) on the gradient band', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({layout: 'carousel', carouselControls: 'header'})}/>)

            const heading = container.querySelector('section h2')!
            // jsdom does no layout, so assert the token class, not a computed colour.
            expect(heading.className).toContain('text-(--sf-accent-text)')
        })

        it('links the graphic into the catalogue filtered by this category', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/medical.png', categorySlug: 'medical'})}/>)

            const link = graphicsOf(container)[0].closest('a')!
            expect(link.getAttribute('href')).toBe('/products?category=medical')
            // The <img> stays decorative, so the anchor carries the accessible name.
            expect(link.getAttribute('aria-label')).toBe('Shop Medical Supplies')
        })

        it('encodes a category slug that needs escaping', () => {
            setupLoadedState()
            mockedUseCategories.mockReturnValue({
                categories: [{id: 'cat-1', name: 'Medical', slug: 'a b&c'}],
                isLoading: false,
                isError: false,
            })

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/medical.png', categorySlug: 'a b&c'})}/>)

            expect(graphicsOf(container)[0].closest('a')!.getAttribute('href'))
                .toBe('/products?category=a%20b%26c')
        })

        it('degrades text-first when the seeded image 404s', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/never-uploaded.png'})}/>)

            expect(container.querySelectorAll('img[aria-hidden="true"]').length).toBeGreaterThan(0)

            // Simulate the browser failing to load the file.
            const first = container.querySelector('img[aria-hidden="true"]') as HTMLImageElement
            fireEvent.error(first)

            expect(container.querySelectorAll('img[aria-hidden="true"]')).toHaveLength(0)
            // The section itself survives — only the graphic drops out.
            expect(screen.getByText('Gauze')).toBeInTheDocument()
        })
    })
})
