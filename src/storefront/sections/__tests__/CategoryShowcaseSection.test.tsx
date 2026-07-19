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

describe('CategoryShowcaseSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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

        const {container} = render(<CategoryShowcaseSection section={buildSection({categorySlug: 'non-existent'})}/>)
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

        const {container} = render(<CategoryShowcaseSection section={buildSection()}/>)
        expect(container.innerHTML).toBe('')
    })

    it('renders product cards when products returned', () => {
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
                {
                    id: 'p2',
                    name: 'Masks',
                    slug: 'masks',
                    shortDescription: '',
                    images: [],
                    retailPrice: null,
                    wholesalePrice: null,
                    retailSalePrice: null,
                    wholesaleSalePrice: null,
                    variantId: null,
                },
            ],
            totalElements: 2,
            totalPages: 1,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        })

        render(<CategoryShowcaseSection section={buildSection()}/>)

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

        render(<CategoryShowcaseSection section={buildSection({categorySlug: 'medical'})}/>)

        expect(mockedUseProducts).toHaveBeenCalledWith({
            categoryId: undefined,
            enabled: false,
        })
    })

    it('renders decorative image when imageUrl provided', () => {
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

        const {container} = render(<CategoryShowcaseSection
            section={buildSection({imageUrl: 'categories/medical.png'})}/>)

        const img = container.querySelector('img[aria-hidden="true"]')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', '/static/images/categories/medical.png')
    })
})
