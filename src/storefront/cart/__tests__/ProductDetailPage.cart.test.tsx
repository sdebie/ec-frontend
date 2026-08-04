import {act, fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useCartStore} from '../store/cartStore'
import {useProductDetail} from '@/storefront/catalog/hooks/useProductDetail'
import {ProductDetailPage} from '@/storefront/catalog/ProductDetailPage'

vi.mock('@/storefront/catalog/hooks/useProductDetail', () => ({
    useProductDetail: vi.fn(),
}))

vi.mock('@/shared/config/storefrontConfig.context', () => ({
    useStorefrontConfig: () => ({currency: 'ZAR', locale: 'en-ZA'}),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: (selector?: (state: Record<string, unknown>) => unknown) => {
        const state = { customerType: 'RETAIL', isSignedIn: false, token: null, email: null, firstName: null, lastName: null }
        return selector ? selector(state) : state
    },
}))

const mockProduct = {
    id: 'prod-1',
    name: 'Test Shirt',
    slug: 'test-shirt',
    shortDescription: 'A test shirt',
    description: 'Detailed description',
    category: {id: 'cat-1', name: 'Shirts', slug: 'shirts'},
    categories: [{id: 'cat-1', name: 'Shirts', slug: 'shirts'}],
    brand: {id: 'brand-1', name: 'TestBrand', logoUrl: null},
    images: [],
    variants: [
        {
            id: 'variant-1',
            retailPrice: 150,
            wholesalePrice: 100,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 10,
            attributesJson: '{"color":"Red","size":"M"}',
        },
        {
            id: 'variant-2',
            retailPrice: 200,
            wholesalePrice: 120,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 5,
            attributesJson: '{"color":"Blue","size":"M"}',
        },
        {
            id: 'variant-3',
            retailPrice: 180,
            wholesalePrice: 110,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 5,
            attributesJson: '{"color":"Red","size":"L"}',
        },
        {
            id: 'variant-oos',
            retailPrice: 150,
            wholesalePrice: 100,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 0,
            attributesJson: '{"color":"Blue","size":"L"}',
        },
    ],
}

/**
 * Product where selecting "Blue" + "L" yields no matching variant
 * (only Blue/M and Red/L exist), enabling the "no variant selected" disabled state.
 */
const mockProductPartialCombination = {
    ...mockProduct,
    variants: [
        {
            id: 'variant-rm',
            retailPrice: 150,
            wholesalePrice: 100,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 10,
            attributesJson: '{"color":"Red","size":"M"}',
        },
        {
            id: 'variant-bl',
            retailPrice: 150,
            wholesalePrice: 100,
            retailSalePrice: null,
            wholesaleSalePrice: null,
            stockQuantity: 10,
            attributesJson: '{"color":"Blue","size":"L"}',
        },
    ],
}

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderProductDetailPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/products/test-shirt']}>
                <Routes>
                    <Route path="/products/:slug" element={<ProductDetailPage/>}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

function selectVariant(color: string, size: string) {
    fireEvent.click(screen.getByRole('button', {name: color}))
    fireEvent.click(screen.getByRole('button', {name: size}))
}

describe('ProductDetailPage — cart integration', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
        vi.mocked(useProductDetail).mockReturnValue({
            product: mockProduct,
            isLoading: false,
            isError: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('adds item to cart with correct args when variant is selected and "Add to Cart" is clicked', () => {
        renderProductDetailPage()

        // Select "Red" color and "M" size to match variant-1
        selectVariant('Red', 'M')

        fireEvent.click(screen.getByRole('button', {name: /add to cart/i}))

        // Verify cart state
        const {items} = useCartStore.getState()
        expect(items).toHaveLength(1)
        expect(items[0]).toEqual({
            variantId: 'variant-1',
            productName: 'Test Shirt',
            variantLabel: 'Red / M',
            quantity: 1,
        })
    })

    it('uses the standard constrained storefront page layout', () => {
        renderProductDetailPage()

        const inner = screen.getByRole('navigation', {name: /breadcrumb/i}).parentElement
        // Default width, not `wide` — one page width across the site.
        expect(inner).toHaveClass('mx-auto', 'max-w-6xl')
        expect(inner?.parentElement).toHaveClass('py-12', 'px-6', 'sm:px-8')
    })

    it('shows confirmation message with "View cart" link after adding to cart', () => {
        renderProductDetailPage()

        // Select variant and add to cart
        selectVariant('Red', 'M')
        fireEvent.click(screen.getByRole('button', {name: /add to cart/i}))

        // Confirmation message appears
        expect(screen.getByText(/added to cart/i)).toBeInTheDocument()
        const viewCartLink = screen.getByRole('link', {name: /view cart/i})
        expect(viewCartLink).toHaveAttribute('href', '/cart')

        // Button changes to "Added ✓" and is disabled
        const addedButton = screen.getByRole('button', {name: /added ✓/i})
        expect(addedButton).toBeDisabled()
    })

    it('auto-dismisses confirmation message after 4 seconds', () => {
        vi.useFakeTimers()

        renderProductDetailPage()

        // Select variant and add to cart
        selectVariant('Red', 'M')
        fireEvent.click(screen.getByRole('button', {name: /add to cart/i}))

        // Confirmation visible
        expect(screen.getByText(/added to cart/i)).toBeInTheDocument()

        // Advance time by 4 seconds
        act(() => {
            vi.advanceTimersByTime(4000)
        })

        // Confirmation should disappear
        expect(screen.queryByText(/added to cart/i)).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: /add to cart/i})).toBeEnabled()

        vi.useRealTimers()
    })

    it('shows disabled "Out of stock" button when variant has stockQuantity === 0', () => {
        renderProductDetailPage()

        // variant-oos has color=Blue, size=L and stockQuantity=0
        // "Blue" is clickable because variant-2 (Blue/M) has stock>0
        // "L" is clickable because the VariantSelector only disables if ALL variants
        // with that value are OOS — we only have one variant with size=L (variant-oos)
        // but need to ensure "L" button is available. Since variant-oos is the only "L" variant
        // and it's OOS, "L" might be disabled. Let's select Blue first, then L.
        fireEvent.click(screen.getByRole('button', {name: 'Blue'}))
        fireEvent.click(screen.getByRole('button', {name: 'L'}))

        // "Out of stock" button should appear and be disabled
        const oosButton = screen.getByRole('button', {name: /out of stock/i})
        expect(oosButton).toBeDisabled()

        expect(screen.queryByRole('button', {name: /add to cart/i})).not.toBeInTheDocument()
    })

    it('disables "Add to Cart" button when no variant is selected', () => {
        // Use a product where selecting an invalid combination yields no matching variant
        vi.mocked(useProductDetail).mockReturnValue({
            product: mockProductPartialCombination,
            isLoading: false,
            isError: false,
        })

        renderProductDetailPage()

        // Select Red + L — no variant has this combination (only Red/M and Blue/L exist)
        selectVariant('Red', 'L')

        // Button should be disabled since no variant matches
        const addButton = screen.getByRole('button', {name: /add to cart/i})
        expect(addButton).toBeDisabled()
    })
})
