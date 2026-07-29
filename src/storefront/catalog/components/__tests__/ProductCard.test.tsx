import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {ProductCard} from '../ProductCard'
import {formatAmount} from '@/shared/utils/formatAmount'
import {describe, expect, it, vi} from 'vitest'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: (selector: (state: { customerType: string }) => string) =>
        selector({customerType: 'RETAIL'}),
}))

// Intl.NumberFormat uses non-breaking spaces — custom normalizer preserves them
const normalizer = (text: string) => text.trim()

function renderCard(productOverrides: Partial<Parameters<typeof ProductCard>[0]['product']> = {}) {
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
            <ProductCard product={defaultProduct}/>
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

        it('renders a View product affordance', () => {
            renderCard()
            expect(screen.getByText('View product')).toBeInTheDocument()
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
        it('links to /products/{slug}', () => {
            renderCard({slug: 'test-product'})

            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', '/products/test-product')
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
})
