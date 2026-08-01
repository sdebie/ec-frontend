import {render, screen, cleanup} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {ProductCard} from '../ProductCard'
import {formatAmount} from '@/shared/utils/formatAmount'
import {describe, expect, it, vi} from 'vitest'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: (selector?: (state: { customerType: string; isSignedIn: boolean }) => unknown) => {
        const state = {customerType: 'RETAIL', isSignedIn: false}
        return selector ? selector(state) : state
    },
}))

vi.mock('@/storefront/customer/account/wishlist/WishlistButton', () => ({
    WishlistButton: ({variantId, className}: { variantId: string; className?: string }) => (
        <button type="button" aria-label={`Wishlist ${variantId}`} className={className}>♡</button>
    ),
}))

// Intl.NumberFormat uses non-breaking spaces — custom normalizer preserves them
const normalizer = (text: string) => text.trim()

function renderCard(
    productOverrides: Partial<Parameters<typeof ProductCard>[0]['product']> = {},
    props: Partial<Omit<Parameters<typeof ProductCard>[0], 'product'>> = {},
) {
    const defaultProduct = {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        images: [
            {imageUrl: 'https://example.com/img.jpg', featured: true, sortOrder: 1},
        ],
        retailPrice: {price: 199.99},
        wholesalePrice: {price: 149.99},
        retailSalePrice: null,
        wholesaleSalePrice: null,
        ...productOverrides,
    }

    return render(
        <MemoryRouter>
            <ProductCard product={defaultProduct} {...props}/>
        </MemoryRouter>,
    )
}

describe('ProductCard', () => {
    describe('standardized card contract (2026-07-24)', () => {
        it('renders the display price with an ex. VAT label', () => {
            renderCard()
            expect(screen.getByText('ex. VAT')).toBeInTheDocument()
        })

        it('renders the wholesale price as small secondary text for non-wholesale shoppers', () => {
            renderCard()
            expect(screen.getByText(/Wholesale:/)).toBeInTheDocument()
        })

        it('omits the wholesale line when no wholesale price exists', () => {
            renderCard({wholesalePrice: null, wholesaleSalePrice: null})
            expect(screen.queryByText(/Wholesale:/)).not.toBeInTheDocument()
        })

        it('renders discrete navigation links (image and title) to the PDP', () => {
            renderCard()
            const links = screen.getAllByRole('link')
            expect(links.length).toBeGreaterThanOrEqual(2)
        })

        it('renders a badge pill over the image when the badge prop is set, and none otherwise', () => {
            const product = {
                id: '1',
                name: 'Badged',
                slug: 'badged',
                images: [],
                retailPrice: {price: 10},
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
            }
            const {rerender} = render(
                <MemoryRouter>
                    <ProductCard product={product} badge="Best Seller"/>
                </MemoryRouter>,
            )
            const pill = screen.getByText('Best Seller')
            expect(pill).toHaveClass('bg-(--sf-accent)')

            rerender(
                <MemoryRouter>
                    <ProductCard product={product}/>
                </MemoryRouter>,
            )
            expect(screen.queryByText('Best Seller')).not.toBeInTheDocument()
        })
    })

    describe('layout prop (Req 7.2, 7.4)', () => {
        it('defaults to grid layout when layout prop is not passed', () => {
            const {container} = renderCard()
            const root = container.firstElementChild as HTMLElement
            expect(root.getAttribute('data-layout')).toBe('grid')
        })

        it('renders grid layout with data-layout="grid" when layout="grid"', () => {
            const {container} = renderCard({}, {layout: 'grid'})
            const root = container.firstElementChild as HTMLElement
            expect(root.getAttribute('data-layout')).toBe('grid')
        })

        it('renders row layout with data-layout="row" when layout="row"', () => {
            const {container} = renderCard({}, {layout: 'row'})
            const root = container.firstElementChild as HTMLElement
            expect(root.getAttribute('data-layout')).toBe('row')
        })

        it('both layouts render the same product name', () => {
            renderCard({name: 'Widget Pro'}, {layout: 'grid'})
            expect(screen.getByText('Widget Pro')).toBeInTheDocument()
            cleanup()

            renderCard({name: 'Widget Pro'}, {layout: 'row'})
            expect(screen.getByText('Widget Pro')).toBeInTheDocument()
        })

        it('both layouts render the same SKU line', () => {
            renderCard({sku: 'WDG-100'}, {layout: 'grid'})
            expect(screen.getByText('SKU: WDG-100')).toBeInTheDocument()
            cleanup()

            renderCard({sku: 'WDG-100'}, {layout: 'row'})
            expect(screen.getByText('SKU: WDG-100')).toBeInTheDocument()
        })

        it('both layouts render the same stock indicator', () => {
            renderCard({inStock: true}, {layout: 'grid'})
            expect(screen.getByText('In stock')).toBeInTheDocument()
            cleanup()

            renderCard({inStock: true}, {layout: 'row'})
            expect(screen.getByText('In stock')).toBeInTheDocument()
        })

        it('both layouts render the same price', () => {
            const expectedPrice = formatAmount(199.99, 'ZAR', 'en-ZA')
            renderCard({retailPrice: {price: 199.99}}, {layout: 'grid'})
            expect(screen.getByText(expectedPrice, {normalizer})).toBeInTheDocument()
            cleanup()

            renderCard({retailPrice: {price: 199.99}}, {layout: 'row'})
            expect(screen.getByText(expectedPrice, {normalizer})).toBeInTheDocument()
        })

        it('both layouts render the same number of links (image + title)', () => {
            renderCard({}, {layout: 'grid'})
            const gridLinks = screen.getAllByRole('link')
            cleanup()

            renderCard({}, {layout: 'row'})
            const rowLinks = screen.getAllByRole('link')
            expect(rowLinks.length).toBe(gridLinks.length)
        })

        it('both layouts have the same interactive buttons (CardActions + Wishlist)', () => {
            renderCard({inStock: true}, {layout: 'grid', variantId: 'v-1'})
            const gridButtons = screen.getAllByRole('button')
            const gridButtonCount = gridButtons.length
            cleanup()

            renderCard({inStock: true}, {layout: 'row', variantId: 'v-1'})
            const rowButtons = screen.getAllByRole('button')
            expect(rowButtons.length).toBe(gridButtonCount)
        })

        it('row layout renders shortDescription', () => {
            renderCard(
                {shortDescription: 'A powerful widget for professionals'},
                {layout: 'row'},
            )
            expect(screen.getByTestId('short-description')).toHaveTextContent(
                'A powerful widget for professionals',
            )
        })

        it('grid layout does NOT render shortDescription', () => {
            renderCard(
                {shortDescription: 'A powerful widget for professionals'},
                {layout: 'grid'},
            )
            expect(screen.queryByTestId('short-description')).not.toBeInTheDocument()
        })

        it('row layout root element is a div, not a link', () => {
            const {container} = renderCard({}, {layout: 'row'})
            const root = container.firstElementChild
            expect(root?.tagName).toBe('DIV')
        })

        it('row layout uses responsive flex classes for stacking on narrow viewports', () => {
            const {container} = renderCard({}, {layout: 'row'})
            const root = container.firstElementChild as HTMLElement
            expect(root.className).toContain('flex-col')
            expect(root.className).toContain('sm:flex-row')
        })
    })

    describe('sale price display', () => {
        it('renders both sale price and original price with strikethrough when sale is active', () => {
            renderCard({
                retailPrice: {price: 299.99},
                wholesalePrice: {price: 249.99},
                retailSalePrice: {price: 199.99},
                wholesaleSalePrice: null,
            })

            const formattedSalePrice = formatAmount(199.99, 'ZAR', 'en-ZA')
            const formattedOriginalPrice = formatAmount(299.99, 'ZAR', 'en-ZA')

            expect(screen.getByText(formattedSalePrice, {normalizer})).toBeInTheDocument()
            expect(screen.getByText(formattedOriginalPrice, {normalizer})).toBeInTheDocument()

            const originalPriceEl = screen.getByText(formattedOriginalPrice, {normalizer})
            expect(originalPriceEl).toHaveClass('line-through')
        })
    })

    describe('missing image', () => {
        it('renders placeholder div and no img tag when images array is empty', () => {
            const {container} = renderCard({images: []})

            expect(container.querySelector('img')).toBeNull()
            // Placeholder SVG is rendered inside the placeholder div
            expect(container.querySelector('svg')).toBeInTheDocument()
        })
    })

    describe('Link target', () => {
        it('renders discrete image and title links to /products/{slug}', () => {
            renderCard({slug: 'test-product'})

            const links = screen.getAllByRole('link')
            expect(links.length).toBeGreaterThanOrEqual(2)
            // Both image and title link to the PDP
            links.forEach((link) => {
                expect(link).toHaveAttribute('href', '/products/test-product')
            })
        })

        it('root element is not a link', () => {
            const {container} = renderCard()
            // The root element is a div, not an anchor
            const root = container.firstElementChild
            expect(root?.tagName).toBe('DIV')
        })
    })

    describe('price formatting', () => {
        it('uses formatAmount output for display', () => {
            renderCard({
                retailPrice: {price: 199.99},
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
            })

            const expectedFormatted = formatAmount(199.99, 'ZAR', 'en-ZA')
            expect(screen.getByText(expectedFormatted, {normalizer})).toBeInTheDocument()
        })
    })

    describe('SKU line (Req 4.5)', () => {
        it('renders "SKU: xxx" when product.sku is a non-empty string', () => {
            renderCard({sku: 'ABC-123'})
            expect(screen.getByText('SKU: ABC-123')).toBeInTheDocument()
        })

        it('renders nothing when product.sku is null', () => {
            renderCard({sku: null})
            expect(screen.queryByText(/^SKU:/)).not.toBeInTheDocument()
        })

        it('renders nothing when product.sku is undefined (field not selected)', () => {
            renderCard({})
            expect(screen.queryByText(/^SKU:/)).not.toBeInTheDocument()
        })

        it('renders nothing when product.sku is an empty string', () => {
            renderCard({sku: ''})
            expect(screen.queryByText(/^SKU:/)).not.toBeInTheDocument()
        })
    })

    describe('stock indicator tri-state (Req 4.6)', () => {
        it('renders "In stock" with green text when inStock is true', () => {
            renderCard({inStock: true})
            const indicator = screen.getByText('In stock')
            expect(indicator).toBeInTheDocument()
            expect(indicator).toHaveClass('text-green-600')
        })

        it('renders "Out of stock" with muted text when inStock is false', () => {
            renderCard({inStock: false})
            const indicator = screen.getByText('Out of stock')
            expect(indicator).toBeInTheDocument()
            expect(indicator).toHaveClass('text-(--sf-muted-text)')
        })

        it('renders no indicator when inStock is null', () => {
            renderCard({inStock: null})
            expect(screen.queryByText('In stock')).not.toBeInTheDocument()
            expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
        })

        it('renders no indicator when inStock is undefined (field not selected)', () => {
            renderCard({})
            expect(screen.queryByText('In stock')).not.toBeInTheDocument()
            expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
        })
    })

    describe('existing-consumer shape (neither sku nor inStock supplied)', () => {
        it('renders without crash and shows no SKU line or stock indicator', () => {
            // Simulate a consumer (featured, wishlist, category showcase) that does
            // not select sku/inStock — the product object simply omits the fields.
            const consumerProduct = {
                id: '99',
                name: 'Featured Item',
                slug: 'featured-item',
                images: [{imageUrl: 'https://example.com/feat.jpg', featured: true, sortOrder: 1}],
                retailPrice: {price: 59.99},
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
                // No sku, no inStock — fields not present at all
            }

            render(
                <MemoryRouter>
                    <ProductCard product={consumerProduct}/>
                </MemoryRouter>,
            )

            // Card renders its core content
            expect(screen.getByText('Featured Item')).toBeInTheDocument()
            // No SKU line, no stock indicator
            expect(screen.queryByText(/^SKU:/)).not.toBeInTheDocument()
            expect(screen.queryByText('In stock')).not.toBeInTheDocument()
            expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
        })

        it('SIMPLE product with a price but no inStock field stays purchasable, never "Out of stock"', () => {
            // The audit-found defect shape: featured/sale sections pass variantId
            // (SIMPLE) and a price, but their queries may not select inStock.
            // Unknown stock must NOT render the disabled Out-of-stock button —
            // CardActions gates on inStock === false strictly.
            const consumerProduct = {
                id: '100',
                name: 'Featured Simple Item',
                slug: 'featured-simple-item',
                images: [{imageUrl: 'https://example.com/feat2.jpg', featured: true, sortOrder: 1}],
                retailPrice: {price: 59.99},
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
                // No inStock — field not selected by this consumer
            }

            render(
                <MemoryRouter>
                    <ProductCard product={consumerProduct} variantId="v-100"/>
                </MemoryRouter>,
            )

            expect(screen.getByRole('button', {name: 'Add to cart'})).toBeInTheDocument()
            expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
        })
    })
})
