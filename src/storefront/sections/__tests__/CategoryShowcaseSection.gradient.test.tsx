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
                variantId: null,
            },
        ],
        totalElements: 1,
        totalPages: 1,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })
}

describe('CategoryShowcaseSection — configured background contract', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('uses the authored gradient string from section configuration', () => {
        setupMocksForRendering()

        const gradient = 'linear-gradient(90deg, rgb(14, 165, 233) 0%, rgb(29, 78, 216) 50%, rgb(2, 6, 23) 100%)'
        const {container} = render(
            <CategoryShowcaseSection section={buildSection({gradient})}/>
        )

        const section = container.querySelector('section')
        expect(section).not.toBeNull()
        expect(section!.style.background).toContain('linear-gradient(90deg')
        expect(section!.style.background).toContain('0%')
        expect(section!.style.background).toContain('50%')
        expect(section!.style.background).toContain('100%')
    })

    it('derives the documented fallback gradient from themeColor when no gradient is configured', () => {
        setupMocksForRendering()

        const {container} = render(
            <CategoryShowcaseSection section={buildSection({themeColor: '#1a3a5c'})}/>
        )

        const section = container.querySelector('section')
        expect(section).not.toBeNull()
        const bg = section!.style.background
        expect(bg).toContain('linear-gradient(135deg')
        expect(bg).toContain('rgba(26, 58, 92, 0.133)')
        expect(bg).toContain('rgba(26, 58, 92, 0.03)')
    })

    it('uses the storefront accent-text token for the title', () => {
        setupMocksForRendering()

        render(<CategoryShowcaseSection section={buildSection()}/>)

        const title = screen.getByText('Medical Supplies')
        expect(title.tagName).toBe('H2')
        expect(title).toHaveClass('text-(--sf-accent-text)')
    })

    it('uses the safe default colour when themeColor is invalid', () => {
        setupMocksForRendering()

        const {container} = render(<CategoryShowcaseSection section={buildSection({themeColor: '#not-a-colour'})}/>)

        expect(container.querySelector('section')!.style.background).toContain('rgba(107, 114, 128, 0.133)')
    })
})
