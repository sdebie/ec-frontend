import {render} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import fc from 'fast-check'
import {CategoryShowcaseSection} from '../CategoryShowcaseSection'
import {useCategories} from '@/storefront/catalog/hooks/useCategories'
import {useProducts} from '@/storefront/catalog/hooks/useProducts'

vi.mock('@/storefront/catalog/hooks/useCategories', () => ({useCategories: vi.fn()}))
vi.mock('@/storefront/catalog/hooks/useProducts', () => ({useProducts: vi.fn()}))
vi.mock('@/storefront/catalog/components/ProductCard', () => ({ProductCard: () => <div/>}))

const mockedUseCategories = vi.mocked(useCategories)
const mockedUseProducts = vi.mocked(useProducts)

describe('CategoryShowcaseSection configuration property', () => {
    // Generator for hex colour strings (#rrggbb format)
    const hexCharArb = fc.constantFrom(
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f'
    )
    const hexColorArb = fc
        .array(hexCharArb, {minLength: 6, maxLength: 6})
        .map((chars) => `#${chars.join('')}`)

    beforeEach(() => {
        mockedUseCategories.mockReturnValue({
            categories: [{id: 'category-1', name: 'Category', slug: 'category'}],
            isLoading: false,
            isError: false,
        })
        mockedUseProducts.mockReturnValue({
            products: [{id: 'product-1', name: 'Product', slug: 'product', shortDescription: '', images: [], retailPrice: null, wholesalePrice: null, retailSalePrice: null, wholesaleSalePrice: null, variantId: null, sku: null, inStock: null}],
            totalElements: 1,
            totalPages: 1,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        })
    })

    it('preserves every authored CSS gradient instead of deriving tenant-specific colours in code', () => {
        fc.assert(
            fc.property(hexColorArb, hexColorArb, (start, end) => {
                const gradient = `linear-gradient(90deg, ${start} 0%, ${end} 100%)`
                const {container, unmount} = render(
                    <CategoryShowcaseSection section={{
                        id: 'section-1',
                        type: 'category-showcase',
                        props: {title: 'Category', categorySlug: 'category', themeColor: '#000000', gradient},
                    }}/>,
                )
                expect(container.querySelector('section')!.style.background).toContain('linear-gradient(90deg')
                unmount()
            }),
            {numRuns: 50}
        )
    })
})
