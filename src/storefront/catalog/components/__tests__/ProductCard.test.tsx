import {render, screen, cleanup} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {ProductCard} from '../ProductCard'
import {formatAmount} from '@/shared/utils/formatAmount'
import {describe, expect, it, vi, afterEach} from 'vitest'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

const {mockCustomerType} = vi.hoisted(() => ({mockCustomerType: {value: 'RETAIL'}}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: (selector?: (state: { customerType: string; isSignedIn: boolean }) => unknown) => {
        const state = {customerType: mockCustomerType.value, isSignedIn: mockCustomerType.value !== 'GUEST'}
        return selector ? selector(state) : state
    },
}))


vi.mock('@/storefront/customer/account/wishlist/components/WishlistButton', () => ({
    WishlistPromptLink: ({productUrl, className}: {productUrl: string; className?: string}) => (
        <a href={productUrl} aria-label="Choose options to save to wishlist" className={className}>♡</a>
    ),
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
    afterEach(() => {
        mockCustomerType.value = 'RETAIL'
    })

    describe('border weight', () => {
        it('keeps the hairline outline by default — the catalogue must not thicken', () => {
            const {container} = renderCard()

            const root = container.querySelector('[data-layout="grid"]')!
            expect(root.className).toContain('border border-(--sf-border)/60')
            expect(root.className).not.toContain('border-2')
        })

        it('renders a heavier border when the consumer opts in', () => {
            const {container} = renderCard({}, {borderWeight: 'thick'})

            const root = container.querySelector('[data-layout="grid"]')!
            expect(root.className).toContain('border-2 border-(--sf-border)')
            expect(root.className).not.toContain('border-(--sf-border)/60')
        })

        it('uses a border, not an inset outline the image stage would cover', () => {
            const {container} = renderCard({}, {borderWeight: 'thick'})

            // An inset outline paints beneath the card's own children, so the
            // full-bleed image stage occludes it along the top edge and that
            // side reads thinner than the other three.
            const root = container.querySelector('[data-layout="grid"]')!
            expect(root.className).not.toContain('outline')
        })

        it('applies to the row layout too', () => {
            const {container} = renderCard({}, {layout: 'row', borderWeight: 'thick'})

            expect(container.querySelector('[data-layout="row"]')!.className).toContain('border-2')
        })
    })

    describe('wishlist affordance', () => {
        it('renders the real wishlist toggle when the card has a variant', () => {
            renderCard({}, {variantId: 'variant-1'})

            expect(screen.getByLabelText('Wishlist variant-1')).toBeInTheDocument()
            expect(screen.queryByLabelText('Choose options to save to wishlist')).not.toBeInTheDocument()
        })

        it('routes the heart to the product page when there is no variant to save', () => {
            renderCard({slug: 'blue-overall'}, {variantId: null})

            // The wishlist is variant-keyed, so a variable product must NOT write —
            // the heart is a door to the PDP where a variant gets chosen.
            const heart = screen.getByLabelText('Choose options to save to wishlist')
            expect(heart.tagName).toBe('A')
            expect(heart).toHaveAttribute('href', '/products/blue-overall')
            expect(screen.queryByLabelText(/^Wishlist /)).not.toBeInTheDocument()
        })

        it('renders no wishlist affordance at all when the card suppresses it', () => {
            renderCard({}, {variantId: null, showWishlistButton: false})

            expect(screen.queryByLabelText('Choose options to save to wishlist')).not.toBeInTheDocument()
            expect(screen.queryByLabelText(/^Wishlist /)).not.toBeInTheDocument()
        })

        it('reserves the SKU line on a variable product so decks stay aligned', () => {
            const {container} = renderCard({sku: null}, {variantId: null})

            // Not a visible SKU, but the row still occupies its line.
            expect(screen.queryByText(/SKU:/)).not.toBeInTheDocument()
            expect(container.querySelector('p[aria-hidden="true"]')).not.toBeNull()
        })
    })

    describe('standardized card contract', () => {
        it('renders the display price with an ex. VAT label', () => {
            renderCard()
            expect(screen.getByText('ex. VAT')).toBeInTheDocument()
        })

        it('names BOTH tiers, with the shopper\'s own tier carrying the weight', () => {
            renderCard({retailPrice: {price: 199.99}, wholesalePrice: {price: 149.99}})

            // Signed-out shopper is charged retail, so Retail leads.
            const retail = screen.getByText('Retail')
            const wholesale = screen.getByText('Wholesale')
            expect(retail).toBeInTheDocument()
            expect(wholesale).toBeInTheDocument()

            const retailAmount = retail.parentElement!.querySelector('.font-semibold')
            expect(retailAmount).not.toBeNull()
            expect(wholesale.parentElement!.querySelector('.font-semibold')).toBeNull()
        })

        it('omits a tier that has no price at all rather than rendering a blank row', () => {
            renderCard({wholesalePrice: null, wholesaleSalePrice: null})
            expect(screen.getByText('Retail')).toBeInTheDocument()
            expect(screen.queryByText('Wholesale')).not.toBeInTheDocument()
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

        it('row layout keeps a compact image rail beside the identity on mobile', () => {
            // The original design stacked the whole row to a column below `sm`,
            // which rendered a viewport-wide square image per row on phones. The
            // image must stay a small fixed square at every width, with the
            // identity beside it — never above or below it.
            const {container} = renderCard({}, {layout: 'row'})
            const root = container.firstElementChild as HTMLElement

            const imageRail = root.firstElementChild as HTMLElement
            expect(imageRail.className).toContain('w-28')
            expect(imageRail.className).toContain('sm:w-40')

            // Below sm: a two-column grid puts the image and identity side by
            // side. From sm: the same nodes lay out as a flex row.
            expect(root.className).toContain('grid-cols-[auto_1fr]')
            expect(root.className).toContain('sm:flex-row')
            expect(root.className).not.toContain('flex-col')
        })

        it('row layout puts price and actions in a bar spanning both columns on mobile, a column from sm', () => {
            // Three direct children — image, identity, price/actions — so one set
            // of nodes reflows between breakpoints instead of being duplicated.
            const {container} = renderCard({}, {layout: 'row'})
            const root = container.firstElementChild as HTMLElement
            expect(root.children).toHaveLength(3)

            const actions = root.children[2] as HTMLElement
            // Mobile: full-width bar, divided from the identity above.
            expect(actions.className).toContain('col-span-2')
            expect(actions.className).toContain('border-t')
            // From sm: the right-hand column with its left divider.
            expect(actions.className).toContain('sm:col-span-1')
            expect(actions.className).toContain('sm:w-48')
            expect(actions.className).toContain('sm:border-l')
            expect(actions.className).toContain('sm:border-t-0')
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

    describe('both tiers named', () => {
        it('still names both tiers when the two prices are EQUAL', () => {
            // Suppressing the wholesale line when it matches retail blanks it
            // for every variant priced the same on both tiers — which, until
            // differentiated wholesale pricing is imported, is all of them. The
            // card would then never show a wholesale rate at all.
            renderCard({
                retailPrice: {price: 179},
                wholesalePrice: {price: 179},
                retailSalePrice: null,
                wholesaleSalePrice: null,
            })
            expect(screen.getByText('Retail')).toBeInTheDocument()
            expect(screen.getByText('Wholesale')).toBeInTheDocument()
        })

        it('names both tiers when the prices differ', () => {
            renderCard({
                retailPrice: {price: 199.99},
                wholesalePrice: {price: 149.99},
                retailSalePrice: null,
                wholesaleSalePrice: null,
            })
            expect(screen.getByText('Retail')).toBeInTheDocument()
            expect(screen.getByText('Wholesale')).toBeInTheDocument()
        })

        it('drops only the tier whose price is missing', () => {
            renderCard({
                retailPrice: {price: 199.99},
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
            })
            expect(screen.getByText('Retail')).toBeInTheDocument()
            expect(screen.queryByText('Wholesale')).not.toBeInTheDocument()
        })

        it('flips the emphasis for a WHOLESALE shopper — their tier leads, retail follows', () => {
            mockCustomerType.value = 'WHOLESALE'

            try {
                renderCard({
                    retailPrice: {price: 199.99},
                    wholesalePrice: {price: 149.99},
                    retailSalePrice: null,
                    wholesaleSalePrice: null,
                })

                // Both still named, but the weight moves to what they are charged.
                const wholesale = screen.getByText('Wholesale')
                const retail = screen.getByText('Retail')
                expect(wholesale.parentElement!.querySelector('.font-semibold')).not.toBeNull()
                expect(retail.parentElement!.querySelector('.font-semibold')).toBeNull()

                // …and the emphasised figure is the wholesale one.
                expect(wholesale.parentElement!.textContent).toContain('149')
                expect(retail.parentElement!.textContent).toContain('199')
            } finally {
                mockCustomerType.value = 'RETAIL'
            }
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
            // Themed status token, not a palette class — the storefront surface
            // binds --c-success/--sf-success so a client can brand it.
            expect(indicator).toHaveClass('text-(--sf-success)')
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

    describe('mobileImage prop (design §3.2)', () => {
        describe('grid layout', () => {
            it('renders default aspect-square stage when mobileImage is absent', () => {
                const {container} = renderCard({}, {layout: 'grid'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('aspect-square')
                expect(imageStage.className).toContain('w-full')
                expect(imageStage.className).not.toContain('h-28')
                expect(imageStage.className).not.toContain('sm:aspect-square')
            })

            it('renders default aspect-square stage when mobileImage="default"', () => {
                const {container} = renderCard({}, {layout: 'grid', mobileImage: 'default'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('aspect-square')
                expect(imageStage.className).toContain('w-full')
                expect(imageStage.className).not.toContain('h-28')
                expect(imageStage.className).not.toContain('sm:aspect-square')
            })

            it('renders compact fixed-height stage when mobileImage="thumbnail"', () => {
                const {container} = renderCard({}, {layout: 'grid', mobileImage: 'thumbnail'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('h-28')
                expect(imageStage.className).toContain('w-full')
                expect(imageStage.className).toContain('sm:aspect-square')
                expect(imageStage.className).toContain('sm:h-auto')
                // The bare (non-prefixed) aspect-square should not appear — only sm:aspect-square
                const classes = imageStage.className.split(/\s+/)
                expect(classes).not.toContain('aspect-square')
            })
        })

        describe('imageAspect prop', () => {
            it('defaults to a square stage when imageAspect is absent', () => {
                const {container} = renderCard({}, {layout: 'grid'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('aspect-square')
                expect(imageStage.className).not.toContain('aspect-[4/3]')
            })

            it('renders a square stage when imageAspect="square" (byte-stable with default)', () => {
                const {container: a} = renderCard({}, {layout: 'grid'})
                const {container: b} = renderCard({}, {layout: 'grid', imageAspect: 'square'})
                const stageOf = (c: HTMLElement) =>
                    (c.firstElementChild as HTMLElement)
                        .querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(stageOf(b).className).toBe(stageOf(a).className)
            })

            it('renders a 4:3 stage when imageAspect="landscape"', () => {
                const {container} = renderCard({}, {layout: 'grid', imageAspect: 'landscape'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('aspect-[4/3]')
                expect(imageStage.className).toContain('w-full')
                const classes = imageStage.className.split(/\s+/)
                expect(classes).not.toContain('aspect-square')
            })

            it('composes with mobileImage="thumbnail" — compact below sm, 4:3 at sm+', () => {
                const {container} = renderCard({}, {layout: 'grid', mobileImage: 'thumbnail', imageAspect: 'landscape'})
                const root = container.firstElementChild as HTMLElement
                const imageStage = root.querySelector('[class*="overflow-hidden bg-(--sf-surface-muted)"]') as HTMLElement
                expect(imageStage.className).toContain('h-28')
                expect(imageStage.className).toContain('sm:aspect-[4/3]')
                expect(imageStage.className).toContain('sm:h-auto')
                expect(imageStage.className).not.toContain('sm:aspect-square')
            })

            it('does not affect the row layout image rail', () => {
                const {container: a} = renderCard({}, {layout: 'row'})
                const {container: b} = renderCard({}, {layout: 'row', imageAspect: 'landscape'})
                const railOf = (c: HTMLElement) => (c.firstElementChild as HTMLElement).firstElementChild as HTMLElement
                expect(railOf(b).className).toBe(railOf(a).className)
            })
        })

        describe('row layout', () => {
            it('renders default w-28 rail when mobileImage is absent', () => {
                const {container} = renderCard({}, {layout: 'row'})
                const root = container.firstElementChild as HTMLElement
                const imageRail = root.firstElementChild as HTMLElement
                expect(imageRail.className).toContain('w-28')
                expect(imageRail.className).toContain('sm:w-40')
                expect(imageRail.className).not.toContain('w-20')
            })

            it('renders default w-28 rail when mobileImage="default"', () => {
                const {container} = renderCard({}, {layout: 'row', mobileImage: 'default'})
                const root = container.firstElementChild as HTMLElement
                const imageRail = root.firstElementChild as HTMLElement
                expect(imageRail.className).toContain('w-28')
                expect(imageRail.className).toContain('sm:w-40')
                expect(imageRail.className).not.toContain('w-20')
            })

            it('renders narrow w-20 rail when mobileImage="thumbnail"', () => {
                const {container} = renderCard({}, {layout: 'row', mobileImage: 'thumbnail'})
                const root = container.firstElementChild as HTMLElement
                const imageRail = root.firstElementChild as HTMLElement
                expect(imageRail.className).toContain('w-20')
                expect(imageRail.className).toContain('sm:w-40')
                expect(imageRail.className).not.toContain('w-28')
            })
        })

        describe('byte-stability', () => {
            it('grid: absent mobileImage produces identical output to mobileImage="default"', () => {
                const {container: absentContainer} = renderCard({}, {layout: 'grid'})
                const absentHtml = absentContainer.innerHTML
                cleanup()

                const {container: defaultContainer} = renderCard({}, {layout: 'grid', mobileImage: 'default'})
                const defaultHtml = defaultContainer.innerHTML

                expect(absentHtml).toBe(defaultHtml)
            })

            it('row: absent mobileImage produces identical output to mobileImage="default"', () => {
                const {container: absentContainer} = renderCard({}, {layout: 'row'})
                const absentHtml = absentContainer.innerHTML
                cleanup()

                const {container: defaultContainer} = renderCard({}, {layout: 'row', mobileImage: 'default'})
                const defaultHtml = defaultContainer.innerHTML

                expect(absentHtml).toBe(defaultHtml)
            })
        })
    })

    describe('variantLabel prop (task 2.2)', () => {
        it('renders variant label text in grid layout when provided', () => {
            renderCard({sku: 'ABC-100'}, {layout: 'grid', variantLabel: 'Size: XL, Colour: Red'})
            expect(screen.getByText('Size: XL, Colour: Red')).toBeInTheDocument()
        })

        it('renders variant label text in row layout when provided', () => {
            renderCard({sku: 'ABC-100'}, {layout: 'row', variantLabel: 'Size: XL, Colour: Red'})
            expect(screen.getByText('Size: XL, Colour: Red')).toBeInTheDocument()
        })

        it('variant label has correct styling classes in grid layout', () => {
            renderCard({sku: 'ABC-100'}, {layout: 'grid', variantLabel: 'Weight: 500g'})
            const label = screen.getByText('Weight: 500g')
            expect(label.tagName).toBe('P')
            expect(label).toHaveClass('mt-1')
            expect(label).toHaveClass('text-xs')
            expect(label).toHaveClass('text-(--sf-muted-text)')
        })

        it('variant label has correct styling classes in row layout', () => {
            renderCard({sku: 'ABC-100'}, {layout: 'row', variantLabel: 'Weight: 500g'})
            const label = screen.getByText('Weight: 500g')
            expect(label.tagName).toBe('P')
            expect(label).toHaveClass('mt-1')
            expect(label).toHaveClass('text-xs')
            expect(label).toHaveClass('text-(--sf-muted-text)')
        })

        it('does not render variant label when prop is absent (grid)', () => {
            const {container: withoutLabel} = renderCard({sku: 'ABC-100'}, {layout: 'grid'})
            // Only the SKU paragraph should contain muted text xs that isn't stock/description
            expect(screen.getByText('SKU: ABC-100')).toBeInTheDocument()
            // The variant label paragraph simply isn't there
            const paragraphs = withoutLabel.querySelectorAll('p')
            const texts = Array.from(paragraphs).map(p => p.textContent)
            expect(texts).not.toContain('')
        })

        it('does not render variant label when prop is empty string (grid)', () => {
            renderCard({sku: 'ABC-100'}, {layout: 'grid', variantLabel: ''})
            // Empty string is falsy → not rendered
            const paragraphs = screen.getByText('SKU: ABC-100').parentElement!.querySelectorAll('p')
            const texts = Array.from(paragraphs).map(p => p.textContent)
            // There should be only the SKU paragraph (no empty variant label paragraph)
            expect(texts.filter(t => t === '')).toHaveLength(0)
        })

        it('absent variantLabel produces byte-identical output (grid)', () => {
            const {container: absentContainer} = renderCard({}, {layout: 'grid'})
            const absentHtml = absentContainer.innerHTML
            cleanup()

            const {container: undefinedContainer} = renderCard({}, {layout: 'grid', variantLabel: undefined})
            const undefinedHtml = undefinedContainer.innerHTML

            expect(absentHtml).toBe(undefinedHtml)
        })

        it('absent variantLabel produces byte-identical output (row)', () => {
            const {container: absentContainer} = renderCard({}, {layout: 'row'})
            const absentHtml = absentContainer.innerHTML
            cleanup()

            const {container: undefinedContainer} = renderCard({}, {layout: 'row', variantLabel: undefined})
            const undefinedHtml = undefinedContainer.innerHTML

            expect(absentHtml).toBe(undefinedHtml)
        })
    })

    describe('focus recipe on root links (task 1.6)', () => {
        it('grid layout image link has the page focus ring classes', () => {
            const {container} = renderCard({}, {layout: 'grid'})
            const links = container.querySelectorAll('a[href="/products/test-product"]')
            // First link is the image link
            const imageLink = links[0] as HTMLElement
            expect(imageLink.className).toContain('focus-visible:ring-2')
            expect(imageLink.className).toContain('focus-visible:ring-offset-(--sf-background)')
        })

        it('grid layout title link has the page focus ring classes', () => {
            const {container} = renderCard({}, {layout: 'grid'})
            // Selected by the heading it wraps, not by index: a card with no
            // variant also renders a wishlist prompt link to the same href.
            const titleLink = container.querySelector('a:has(h3)') as HTMLElement
            expect(titleLink.className).toContain('focus-visible:ring-2')
            expect(titleLink.className).toContain('focus-visible:ring-offset-(--sf-background)')
        })

        it('row layout image link has the page focus ring classes', () => {
            const {container} = renderCard({}, {layout: 'row'})
            const links = container.querySelectorAll('a[href="/products/test-product"]')
            const imageLink = links[0] as HTMLElement
            expect(imageLink.className).toContain('focus-visible:ring-2')
            expect(imageLink.className).toContain('focus-visible:ring-offset-(--sf-background)')
        })

        it('row layout title link has the page focus ring classes', () => {
            const {container} = renderCard({}, {layout: 'row'})
            const titleLink = container.querySelector('a:has(h3)') as HTMLElement
            expect(titleLink.className).toContain('focus-visible:ring-2')
            expect(titleLink.className).toContain('focus-visible:ring-offset-(--sf-background)')
        })
    })

    /*
      The card advertises itself as clickable — accent border, shadow and
      hover:scale on the root — so the whole card must actually navigate, not
      just the image and the name.

      Implemented as a stretched pseudo-element on the EXISTING name link, so
      these assert the two halves that make that safe: the card root is a
      positioning context (or `after:inset-0` would stretch to the viewport), and
      the controls that must stay independently clickable are lifted above it.

      ⚠️ jsdom does no layout, so this cannot prove what a click at a given pixel
      hits. That was verified in a real browser via elementFromPoint plus live
      clicks (card body → PDP, Add to cart → cart written and no navigation,
      heart → toggled and painted). These tests guard the mechanism from being
      removed; they are not a substitute for that check.
    */
    describe('whole-card click target', () => {
        it.each([['grid'], ['row']] as const)('%s layout stretches the name link over a positioned root', (layout) => {
            const {container} = renderCard({}, {layout})
            const root = container.firstElementChild as HTMLElement
            const titleLink = container.querySelector('a:has(h3)') as HTMLElement

            expect(root.className).toContain('relative')
            expect(titleLink.className).toContain('after:absolute')
            expect(titleLink.className).toContain('after:inset-0')
        })

        it('does not add a second link to the same product — the name link IS the target', () => {
            const {container} = renderCard({}, {layout: 'grid', variantId: 'v1'})
            const productLinks = container.querySelectorAll('a[href="/products/test-product"]')
            // Image and name only — the stretched link adds no third anchor.
            expect(productLinks).toHaveLength(2)
        })

        it('lifts the wishlist heart above the stretched link so it saves instead of navigating', () => {
            const {container} = renderCard({}, {layout: 'grid', variantId: 'v1'})
            const heart = container.querySelector('[aria-label="Wishlist v1"]') as HTMLElement
            expect(heart.className).toContain('z-10')
        })

        it('lifts the action control above the stretched link so it adds instead of navigating', () => {
            const {container} = renderCard({}, {layout: 'grid', variantId: 'v1'})
            const addButton = Array.from(container.querySelectorAll('button')).find(
                (b) => b.textContent?.includes('Add to cart'),
            ) as HTMLElement
            expect(addButton.className).toContain('z-10')
        })
    })

    /*
      The heart sits in the card's top-right corner on a phone. In the row layout
      it is a child of the image rail, so the rail's positioning is what decides
      where it lands: `static` below sm lets it resolve against the card root (the
      card's corner), `sm:relative` returns it to the image once the rail is 160px
      wide and the corner belongs to the price column.

      Asserted on the rail rather than on an offset, because the alternative —
      anchoring the heart to the card with a breakpoint offset — would hard-code
      the rail's width a second time.
    */
    describe('wishlist heart position (row layout, mobile)', () => {
        it('makes the image rail a positioning context only from sm, so the heart escapes to the card corner below it', () => {
            const {container} = renderCard({}, {layout: 'row', variantId: 'v1'})
            const rail = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement

            expect(rail.className).toContain('static')
            expect(rail.className).toContain('sm:relative')
        })

        it('reserves the chip lane on the identity block below sm, and gives it back from sm', () => {
            const {container} = renderCard({}, {layout: 'row', variantId: 'v1'})
            const identity = (container.firstElementChild as HTMLElement).children[1] as HTMLElement

            expect(identity.className).toContain('pr-10')
            expect(identity.className).toContain('sm:pr-4')
        })

        it('leaves the price column full width — the heart is over the image at sm+, not over the price', () => {
            const {container} = renderCard({}, {layout: 'row', variantId: 'v1'})
            const priceColumn = (container.firstElementChild as HTMLElement).children[2] as HTMLElement

            // Regression guard: reserving a lane here squeezed sm:w-48 and wrapped
            // "ex. VAT" onto its own line on desktop.
            expect(priceColumn.className).not.toContain('sm:pr-10')
        })
    })
})
