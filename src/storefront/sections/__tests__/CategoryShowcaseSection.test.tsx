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

    it('renders its own h2 above the row and keeps the Carousel in header-controls mode', () => {
        setupLoadedState()

        const {container} = renderWithRouter(
            <CategoryShowcaseSection section={buildSection({layout: 'carousel', carouselControls: 'header'})}/>,
        )

        // Owner directive 2026-08-02: the section owns the heading at every hint
        // so it spans the band above the image rail. The Carousel still runs in
        // header-controls mode (arrows in the header row) — it just carries an
        // sr-only title there instead of a second visible one.
        const sectionEl = container.querySelector('section')!
        const ownHeading = sectionEl.querySelector('h2')
        expect(ownHeading).not.toBeNull()
        expect(ownHeading!.textContent).toContain('Medical Supplies')

        const region = screen.getByRole('region', {name: 'Medical Supplies'})
        expect(region.querySelector('h2')).toBeNull()
        expect(region.querySelector('.sr-only')?.textContent).toBe('Medical Supplies')
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

    // --- Task 5b.2a / Req 6.2a: mobile icon vs md+ side rail ---
    //
    // jsdom does no layout, so these assert on placement CLASSES. The pairing
    // matters: the `w-64` rail must stay `hidden md:flex` (it would otherwise eat
    // two-thirds of a 375px viewport) and the inline icon must stay `md:hidden`.

    describe('image placement (Req 6.2a)', () => {
        // Both graphics are wrapped in a category link, so the responsive
        // classes live on the anchor — assert against that, not the <img>.
        function imagesOf(container: HTMLElement) {
            const all = Array.from(container.querySelectorAll('img[aria-hidden="true"]'))
            return {
                icon: all.find((el) => el.closest('a')?.className.includes('md:hidden')) as HTMLElement | undefined,
                rail: all.find((el) => el.closest('.md\\:flex')) as HTMLElement | undefined,
            }
        }

        it('renders the mobile icon inline and keeps the rail md+ only (default hint)', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/medical.png'})}/>)

            const {icon, rail} = imagesOf(container)

            expect(icon).toBeDefined()
            expect(icon!.closest('a')!.className).toContain('md:hidden')
            // The icon sits beside the title block in the heading row (not inside
            // the h2), so the rule under the title tracks the TEXT on mobile
            // rather than starting under the logo.
            const headingRow = icon!.closest('a')!.parentElement!
            expect(headingRow.querySelector('h2')).not.toBeNull()
            expect(icon!.closest('h2')).toBeNull()

            expect(rail).toBeDefined()
            const railWrapper = rail!.closest('div')!
            expect(railWrapper.className).toContain('hidden')
            expect(railWrapper.className).toContain('md:flex')
            expect(railWrapper.className).toContain('w-64')
        })

        it('keeps its own full-width h2 when carouselControls is "header"', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({
                    imageUrl: 'categories/medical.png',
                    layout: 'carousel',
                    carouselControls: 'header',
                })}/>)

            // Owner directive 2026-08-02: the heading spans the band above the
            // image + deck row for EVERY hint, so it shares a left margin with
            // the desktop icon rail. Under 'header' the Carousel keeps only its
            // arrow row, so the title must not be duplicated.
            const sectionEl = container.querySelector('section')!
            const ownHeading = sectionEl.querySelector('h2')
            expect(ownHeading).not.toBeNull()
            expect(ownHeading!.textContent).toContain('Medical Supplies')

            // Exactly one visible rendering of the title — the Carousel's own
            // header slot carries it as screen-reader-only text.
            const visibleHeadings = screen.getAllByText('Medical Supplies')
                .filter((el) => !el.className.includes('sr-only'))
            expect(visibleHeadings).toHaveLength(1)

            const {icon, rail} = imagesOf(container)
            expect(icon).toBeDefined()
            expect(icon!.closest('a')!.className).toContain('md:hidden')
            // Mobile order is icon THEN heading: the icon is the heading row's
            // first child, with the title block after it.
            const headingRow = icon!.closest('a')!.parentElement!
            expect(headingRow.firstElementChild).toBe(icon!.closest('a'))
            expect(headingRow.querySelector('h2')).toBe(ownHeading)

            // The md+ rail is unaffected by the hint.
            expect(rail).toBeDefined()
            expect(rail!.closest('div')!.className).toContain('md:flex')
        })

        it('renders the heading in white (accent-text token) on the gradient band', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({layout: 'carousel', carouselControls: 'header'})}/>)

            const heading = container.querySelector('section h2')!
            // jsdom does no layout, so assert the token class, not a computed colour.
            expect(heading.className).toContain('text-(--sf-accent-text)')
        })

        it('links both graphics into the catalogue filtered by this category', () => {
            setupLoadedState()

            const {container} = renderWithRouter(<CategoryShowcaseSection
                section={buildSection({imageUrl: 'categories/medical.png', categorySlug: 'medical'})}/>)

            const {icon, rail} = imagesOf(container)
            const hrefs = [icon, rail].map((el) => el!.closest('a')!.getAttribute('href'))

            expect(hrefs).toEqual([
                '/products?category=medical',
                '/products?category=medical',
            ])
            // The <img> stays decorative, so the anchor carries the accessible name.
            expect(icon!.closest('a')!.getAttribute('aria-label')).toBe('Shop Medical Supplies')
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

            const {rail} = imagesOf(container)
            expect(rail!.closest('a')!.getAttribute('href')).toBe('/products?category=a%20b%26c')
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
