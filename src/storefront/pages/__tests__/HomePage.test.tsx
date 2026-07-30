import {render, screen} from '@testing-library/react'
import {describe, it, expect, vi, beforeEach} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig, SectionConfig} from '@/shared/types/StorefrontConfig'
import {HomePage} from '../HomePage'

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

function buildConfig(sections: SectionConfig[]): StorefrontConfig {
    return {
        clientId: 'test-client',
        clientName: 'Test Store',
        currency: 'ZAR',
        locale: 'en-ZA',
        theme: {},
        nav: [],
        sections,
        branding: {name: 'Test Store'},
    }
}

function renderHomePage(sections: SectionConfig[]) {
    return render(
        <MemoryRouter>
            <StorefrontConfigContext.Provider value={buildConfig(sections)}>
                <HomePage/>
            </StorefrontConfigContext.Provider>
        </MemoryRouter>
    )
}

describe('HomePage (regression pin for SectionList extraction)', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('renders sections from config through the real SectionList and sectionRegistry', () => {
        const sections: SectionConfig[] = [
            {
                id: 'home-benefits',
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
                id: 'home-stats',
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
                id: 'home-cta',
                type: 'cta',
                props: {
                    title: 'Get Started Today',
                    description: 'Request a quote',
                    cta: {label: 'Contact Us', to: '/contact-us'},
                },
            },
        ]

        const {container} = renderHomePage(sections)

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

    it('renders sections in the order specified by the config array', () => {
        const sections: SectionConfig[] = [
            {
                id: 'first',
                type: 'stats',
                props: {items: [{value: 'FIRST', label: 'Position One'}]},
            },
            {
                id: 'second',
                type: 'benefits',
                props: {title: 'SECOND', items: [{title: 'B', description: 'D'}]},
            },
        ]

        const {container} = renderHomePage(sections)

        const renderedSections = container.querySelectorAll('section')
        expect(renderedSections[0]).toHaveTextContent('FIRST')
        expect(renderedSections[1]).toHaveTextContent('SECOND')
    })

    it('skips unknown section types without crashing', () => {
        const sections: SectionConfig[] = [
            {
                id: 'unknown-x',
                type: 'totally-fake' as SectionConfig['type'],
                props: {},
            } as unknown as SectionConfig,
            {
                id: 'valid-stats',
                type: 'stats',
                props: {items: [{value: '42', label: 'Answer'}]},
            },
        ]

        renderHomePage(sections)

        // Only the valid section renders
        expect(screen.getByText('42')).toBeInTheDocument()
        expect(screen.getByText('Answer')).toBeInTheDocument()

        // Warning was logged for the unknown type
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Unknown section type: "totally-fake"')
        )
    })

    it('renders an empty shell when config has no sections', () => {
        const {container} = renderHomePage([])

        // The page shell is a div — StorefrontLayout owns the single <main> landmark
        expect(container.querySelector('main')).not.toBeInTheDocument()
        expect(container.firstElementChild).toBeInTheDocument()

        const renderedSections = container.querySelectorAll('section')
        expect(renderedSections).toHaveLength(0)
    })
})
