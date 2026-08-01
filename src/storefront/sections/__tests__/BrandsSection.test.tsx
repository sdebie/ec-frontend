import {render as rtlRender, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {ReactElement} from 'react'
import type {BrandsSectionConfig} from '@/shared/types/StorefrontConfig.ts'
import {BrandsSection} from '../BrandsSection.tsx'
import {useBrands} from '@/storefront/catalog/hooks/useBrands.ts'
import {beforeEach, describe, expect, it, vi} from 'vitest'

vi.mock('@/shared/utils/imageUrl', () => ({
    resolveImageUrl: (path: string | null | undefined) =>
        path ? `/static/images/${path}` : null,
}))

vi.mock('@/storefront/catalog/hooks/useBrands', () => ({
    useBrands: vi.fn(),
}))

const mockedUseBrands = useBrands as ReturnType<typeof vi.fn>

// Brand tiles are links, so every render needs a router context
function render(ui: ReactElement) {
    return rtlRender(ui, {wrapper: MemoryRouter})
}

function makeBrands(count: number) {
    return Array.from({length: count}, (_, i) => ({
        id: `brand-${i + 1}`,
        name: `Brand ${i + 1}`,
        slug: `brand-${i + 1}`,
        logoUrl: `brands/brand-${i + 1}.png`,
    }))
}

function makeSection(
    props: Partial<BrandsSectionConfig['props']> = {},
): BrandsSectionConfig {
    return {
        id: 'brands-section',
        type: 'brands',
        props: {
            ...props,
        },
    }
}

describe('BrandsSection', () => {
    beforeEach(() => {
        mockedUseBrands.mockReturnValue({
            brands: makeBrands(4),
            isLoading: false,
            isError: false,
        })
    })

    describe('Section frame', () => {
        it('renders inside a <section> with standardized rhythm classes', () => {
            const {container} = render(<BrandsSection section={makeSection({title: 'Our Brands'})}/>)

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            // Brands deliberately overrides the standard py-12 rhythm with a compact py-6
            // (owner call 2026-07-24: slimmer brands band).
            expect(sectionEl).toHaveClass('py-6', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-5xl', () => {
            const {container} = render(<BrandsSection section={makeSection({title: 'Our Brands'})}/>)

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-5xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold via SectionHeading', () => {
            render(<BrandsSection section={makeSection({title: 'Our Brands'})}/>)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Our Brands')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            render(<BrandsSection section={makeSection({title: 'Our Brands', eyebrow: 'Trusted Partners'})}/>)

            expect(screen.getByText('Trusted Partners')).toBeInTheDocument()
            expect(screen.getByText('Trusted Partners')).toHaveClass('uppercase', 'tracking-widest')
        })
    })

    it('renders heading when provided', () => {
        render(<BrandsSection section={makeSection({title: 'Our Brands'})}/>)

        expect(
            screen.getByRole('heading', {name: 'Our Brands'}),
        ).toBeInTheDocument()
    })

    it('renders correct number of brand logos', () => {
        render(<BrandsSection section={makeSection()}/>)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(4)
    })

    it('returns null when brands list is empty', () => {
        mockedUseBrands.mockReturnValue({
            brands: [],
            isLoading: false,
            isError: false,
        })

        const {container} = render(<BrandsSection section={makeSection()}/>)
        expect(container.innerHTML).toBe('')
    })

    it('logo alt matches brand name', () => {
        render(<BrandsSection section={makeSection()}/>)

        const images = screen.getAllByRole('img')
        images.forEach((img, i) => {
            expect(img).toHaveAttribute('alt', `Brand ${i + 1}`)
        })
    })

    it('constrains each logo to its tile', () => {
        const {container} = render(<BrandsSection section={makeSection()}/>)

        const tiles = container.querySelectorAll('.overflow-hidden')
        expect(tiles).toHaveLength(4)

        screen.getAllByRole('img').forEach((img) => {
            expect(img).toHaveClass('h-full', 'w-full', 'object-contain')
        })
    })

    it('each tile links to the product list filtered by that brand', () => {
        render(<BrandsSection section={makeSection()}/>)

        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(4)
        links.forEach((link, i) => {
            expect(link).toHaveAttribute('href', `/products?brand=brand-${i + 1}`)
            expect(link).toHaveAccessibleName(`Shop Brand ${i + 1} products`)
        })
    })

    it('respects limit prop — renders at most N logos', () => {
        mockedUseBrands.mockReturnValue({
            brands: makeBrands(6),
            isLoading: false,
            isError: false,
        })

        render(<BrandsSection section={makeSection({limit: 3})}/>)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)
    })
})
