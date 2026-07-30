import {render, screen} from '@testing-library/react'
import {describe, it, expect, vi} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig, SectionConfig} from '@/shared/types/StorefrontConfig'
import {AboutPage} from '../AboutPage'

// Mock hooks used by DB-backed sections (they fetch data) to avoid network calls
vi.mock('@/storefront/catalog/hooks/useCategories', () => ({
    useCategories: vi.fn(() => ({categories: [], isLoading: false, isError: false})),
}))
vi.mock('@/storefront/catalog/hooks/useProducts', () => ({
    useProducts: vi.fn(() => ({products: [], totalElements: 0, totalPages: 0, isLoading: false, isError: false, refetch: vi.fn()})),
}))
vi.mock('@/storefront/sections/hooks/useFeaturedShoppingProducts', () => ({
    useFeaturedShoppingProducts: vi.fn(() => ({products: [], isLoading: false, isError: false})),
}))
vi.mock('@/storefront/sections/hooks/useSaleShoppingProducts', () => ({
    useSaleShoppingProducts: vi.fn(() => ({products: [], isLoading: false, isError: false})),
}))
vi.mock('@/storefront/sections/hooks/useBrands', () => ({
    useBrands: vi.fn(() => ({brands: [], isLoading: false, isError: false})),
}))

// --- Helpers ---

function buildConfig(aboutSections?: SectionConfig[]): StorefrontConfig {
    return {
        clientId: 'test-client',
        clientName: 'Test Store',
        currency: 'ZAR',
        locale: 'en-ZA',
        theme: {},
        nav: [],
        sections: [],
        aboutSections,
        branding: {name: 'Test Store'},
    }
}

function renderAboutPage(aboutSections?: SectionConfig[]) {
    return render(
        <MemoryRouter>
            <StorefrontConfigContext.Provider value={buildConfig(aboutSections)}>
                <AboutPage/>
            </StorefrontConfigContext.Provider>
        </MemoryRouter>
    )
}

describe('AboutPage', () => {
    it('renders sections from mocked useStorefrontConfig through the real SectionList and sectionRegistry', () => {
        const aboutSections: SectionConfig[] = [
            {
                id: 'about-benefits',
                type: 'benefits',
                props: {
                    title: 'Why Choose Us',
                    items: [
                        {title: 'Fast Delivery', description: 'Same-day dispatch'},
                        {title: 'Quality Products', description: 'Premium materials'},
                    ],
                },
            },
            {
                id: 'about-stats',
                type: 'stats',
                props: {
                    title: 'Our Numbers',
                    items: [
                        {value: '48h', label: 'Dispatch time'},
                        {value: '9', label: 'Provinces'},
                    ],
                },
            },
            {
                id: 'about-cta',
                type: 'cta',
                props: {
                    title: 'Get Started Today',
                    description: 'Request a quote',
                    cta: {label: 'Contact Us', to: '/contact-us'},
                },
            },
        ]

        const {container} = renderAboutPage(aboutSections)

        // Verify all three sections rendered
        const renderedSections = container.querySelectorAll('section')
        expect(renderedSections.length).toBeGreaterThanOrEqual(3)

        // Check content from each section type
        expect(screen.getByText('Why Choose Us')).toBeInTheDocument()
        expect(screen.getByText('Fast Delivery')).toBeInTheDocument()
        expect(screen.getByText('Our Numbers')).toBeInTheDocument()
        expect(screen.getByText('48h')).toBeInTheDocument()
        expect(screen.getByText('Get Started Today')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Contact Us'})).toHaveAttribute('href', '/contact-us')
    })

    it('tolerates aboutSections: undefined — renders the shell without sections and without error', () => {
        const {container} = renderAboutPage(undefined)

        // The page shell is a div — StorefrontLayout owns the single <main> landmark
        expect(container.querySelector('main')).not.toBeInTheDocument()
        expect(container.firstElementChild).toBeInTheDocument()

        const renderedSections = container.querySelectorAll('section')
        expect(renderedSections).toHaveLength(0)
    })
})
