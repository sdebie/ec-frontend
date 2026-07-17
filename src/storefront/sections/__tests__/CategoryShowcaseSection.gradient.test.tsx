import {render, screen} from '@testing-library/react'
import {CategoryShowcaseSection} from '../CategoryShowcaseSection.tsx'
import type {CategoryShowcaseSectionConfig} from '@/shared/types/StorefrontConfig.ts'
import {useCategories} from '@/storefront/catalog/hooks/useCategories.ts'
import {useProducts} from '@/storefront/catalog/hooks/useProducts.ts'
import {beforeEach, describe, expect, it, vi} from 'vitest'

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

const mockedUseCategories = vi.mocked(useCategories)
const mockedUseProducts = vi.mocked(useProducts)

function buildSection(overrides: Partial<CategoryShowcaseSectionConfig['props']> = {}): CategoryShowcaseSectionConfig {
    return {
        id: 'section-gradient',
        type: 'category-showcase',
        props: {
            title: 'Medical Supplies',
            categorySlug: 'medical',
            themeColor: '#1a3a5c',
            ...overrides,
        },
    }
}

function setupMocksForRendering() {
    mockedUseCategories.mockReturnValue({
        categories: [{id: 'cat-1', name: 'Medical', slug: 'medical'}],
        isLoading: false,
        isError: false,
    })
    mockedUseProducts.mockReturnValue({
        products: [
            {
                id: 'p1',
                name: 'Gloves',
                slug: 'gloves',
                shortDescription: '',
                images: [],
                retailPrice: null,
                wholesalePrice: null,
                retailSalePrice: null,
                wholesaleSalePrice: null,
            },
        ],
        totalElements: 1,
        totalPages: 1,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })
}

describe('CategoryShowcaseSection — gradient theming', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('applies linear-gradient background when gradientColors has 3 entries', () => {
        setupMocksForRendering()

        const gradientColors = ['rgba(14,165,233,1)', 'rgba(29,78,216,1)', 'rgba(2,6,23,1)']
        const {container} = render(
            <CategoryShowcaseSection section={buildSection({gradientColors})}/>
        )

        const section = container.querySelector('section')
        expect(section).not.toBeNull()
        // jsdom normalises rgba(r,g,b,1) to rgb(r, g, b) and formats with spaces
        expect(section!.style.background).toContain('linear-gradient(90deg')
        expect(section!.style.background).toContain('0%')
        expect(section!.style.background).toContain('50%')
        expect(section!.style.background).toContain('100%')
    })

    it('applies solid themeColor background when gradientColors is not provided', () => {
        setupMocksForRendering()

        const {container} = render(
            <CategoryShowcaseSection section={buildSection({themeColor: '#1a3a5c'})}/>
        )

        const section = container.querySelector('section')
        expect(section).not.toBeNull()
        // jsdom normalises hex to rgb() format
        const bg = section!.style.background
        expect(bg).not.toContain('linear-gradient')
        expect(bg).toBe('rgb(26, 58, 92)')
    })

    it('applies text-white class to the section title', () => {
        setupMocksForRendering()

        render(
            <CategoryShowcaseSection
                section={buildSection({gradientColors: ['rgba(14,165,233,1)', 'rgba(29,78,216,1)', 'rgba(2,6,23,1)']})}
            />
        )

        const title = screen.getByText('Medical Supplies')
        expect(title.tagName).toBe('H2')
        expect(title).toHaveClass('text-white')
    })
})
