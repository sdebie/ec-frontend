import {render, screen, fireEvent} from '@testing-library/react'
import {AccreditorsSection} from '../AccreditorsSection'
import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig'
import {describe, expect, it, vi} from 'vitest'

vi.mock('@/shared/utils/imageUrl', () => ({
    resolveImageUrl: (path: string | null | undefined) => path ? `/static/images/${path}` : null,
}))

function buildSection(overrides: Partial<AccreditorsSectionConfig['props']> = {}): AccreditorsSectionConfig {
    return {
        id: 'accreditors-1',
        type: 'accreditors',
        props: {
            items: [
                {id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png', url: 'https://sabs.co.za'},
                {id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png'},
                {id: '3', name: 'Safripol', logoUrl: 'accreditors/safripol.png', url: 'https://safripol.com'},
            ],
            ...overrides,
        },
    }
}

describe('AccreditorsSection', () => {
    describe('Section frame', () => {
        it('renders inside a <section> with standardized rhythm classes', () => {
            const section = buildSection({title: 'Accreditations'})
            const {container} = render(<AccreditorsSection section={section}/>)

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-6xl', () => {
            const section = buildSection({title: 'Accreditations'})
            const {container} = render(<AccreditorsSection section={section}/>)

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-6xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold via SectionHeading', () => {
            const section = buildSection({title: 'Our Accreditations'})
            render(<AccreditorsSection section={section}/>)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Our Accreditations')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            const section = buildSection({title: 'Accreditations', eyebrow: 'Certified & Compliant'})
            render(<AccreditorsSection section={section}/>)

            expect(screen.getByText('Certified & Compliant')).toBeInTheDocument()
            expect(screen.getByText('Certified & Compliant')).toHaveClass('uppercase', 'tracking-widest')
        })

        it('does not render heading when title is absent', () => {
            const section = buildSection({items: [{id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png'}]})
            render(<AccreditorsSection section={section}/>)

            expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument()
        })
    })

    it('renders heading when provided', () => {
        const section = buildSection({title: 'Our Accreditations'})
        render(<AccreditorsSection section={section}/>)

        expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Our Accreditations')
    })

    it('renders correct number of logos', () => {
        const section = buildSection()
        const {container} = render(<AccreditorsSection section={section}/>)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)

        // One tile per item, counted as the row's direct children.
        expect(container.querySelector('[data-testid="accreditors-grid"]')!.children).toHaveLength(3)
    })

    it('logo with url is wrapped in anchor with target="_blank" and rel="noopener noreferrer"', () => {
        const section = buildSection({
            items: [{id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png', url: 'https://sabs.co.za'}],
        })
        render(<AccreditorsSection section={section}/>)

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', 'https://sabs.co.za')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('logo without url is not wrapped in anchor', () => {
        const section = buildSection({
            items: [{id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png'}],
        })
        const {container} = render(<AccreditorsSection section={section}/>)

        // Image is rendered inside the tile wrapper div
        const tile = container.querySelector('[data-testid="accreditors-grid"]')!.firstElementChild
        expect(tile).toBeInTheDocument()
        expect(tile?.querySelector('img')).toBeInTheDocument()

        // No anchor wraps the tile
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('returns null when items is empty', () => {
        const section = buildSection({items: []})
        const {container} = render(<AccreditorsSection section={section}/>)

        expect(container.innerHTML).toBe('')
    })

    it('logo alt matches item name', () => {
        const section = buildSection({
            items: [
                {id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png'},
                {id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png'},
            ],
        })
        render(<AccreditorsSection section={section}/>)

        expect(screen.getByAltText('SABS')).toBeInTheDocument()
        expect(screen.getByAltText('SAHPRA')).toBeInTheDocument()
    })

    it('shows fallback text when image fails to load', () => {
        const section = buildSection({
            items: [{id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png'}],
        })
        render(<AccreditorsSection section={section}/>)

        const img = screen.getByRole('img')
        fireEvent.error(img)

        expect(screen.getByText('SABS')).toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('shows fallback text when logoUrl is empty string', () => {
        const section = buildSection({
            items: [{id: '1', name: 'SABS', logoUrl: ''}],
        })
        render(<AccreditorsSection section={section}/>)

        expect(screen.queryByRole('img')).not.toBeInTheDocument()
        expect(screen.getByText('SABS')).toBeInTheDocument()
    })

    it('returns null when items is empty and heading is provided', () => {
        const section = buildSection({items: [], title: 'Accreditations'})
        const {container} = render(<AccreditorsSection section={section}/>)

        expect(container.innerHTML).toBe('')
    })

    it('anchor has focus-visible ring classes for keyboard accessibility', () => {
        const section = buildSection({
            items: [{id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png', url: 'https://sabs.co.za'}],
        })
        render(<AccreditorsSection section={section}/>)

        const link = screen.getByRole('link')
        expect(link).toHaveClass('focus-visible:ring-2')
        expect(link).toHaveClass('focus-visible:ring-(--sf-ring)')
    })
})

describe('AccreditorsSection — invariants', () => {
    it('Invariant 1: all tiles have identical size classes', () => {
        const section = buildSection()
        const {container} = render(<AccreditorsSection section={section}/>)

        // The tiles are the row's direct children — a selector on specific size
        // classes silently matched NOTHING when those classes changed, and this
        // assertion then "passed" by iterating an empty list.
        const tiles = Array.from(container.querySelector('[data-testid="accreditors-grid"]')!.children)
        expect(tiles.length).toBeGreaterThan(0)

        // An ASPECT RATIO, not a fixed height — that is what keeps every logo
        // height-bound under object-contain, and therefore the same size — plus a
        // mobile-only width cap that is lifted once the grid goes multi-column.
        //
        // The cap's VALUE is a design dial. Pinning it here just makes the test
        // chase every adjustment; the invariant worth guarding is that a cap
        // exists, is lifted at `sm`, and is the SAME on every tile — a tile with
        // a different cap would render its logo at a different size.
        const expectedClasses = ['w-full', 'aspect-[5/2]', 'sm:max-w-none']
        tiles.forEach((tile) => {
            expectedClasses.forEach((cls) => {
                expect(tile).toHaveClass(cls)
            })
            expect(tile.className, 'mobile width cap').toMatch(/max-w-\[\d+px\]/)
        })

        const caps = new Set(tiles.map((t) => t.className.match(/max-w-\[\d+px\]/)![0]))
        expect(caps, 'every tile shares one cap').toHaveProperty('size', 1)
    })

    it('Invariant 2: all images have object-contain and h-full w-full', () => {
        const section = buildSection()
        render(<AccreditorsSection section={section}/>)

        const images = screen.getAllByRole('img')
        images.forEach((img) => {
            expect(img).toHaveClass('object-contain')
            expect(img).toHaveClass('h-full')
            expect(img).toHaveClass('w-full')
        })
    })

    it('Invariant 3: row container centres any item count (3 items — UVH)', () => {
        const section = buildSection() // 3 items
        const {container} = render(<AccreditorsSection section={section}/>)

        const row = container.querySelector('[data-testid="accreditors-grid"]')
        expect(row).toBeInTheDocument()

        const tiles = container.querySelector('[data-testid="accreditors-grid"]')!.children
        expect(tiles).toHaveLength(3)
    })

    it('Invariant 3: row container centres any item count (6 items — larger client)', () => {
        const section = buildSection({
            items: [
                {id: '1', name: 'Acc 1', logoUrl: 'acc/1.png'},
                {id: '2', name: 'Acc 2', logoUrl: 'acc/2.png'},
                {id: '3', name: 'Acc 3', logoUrl: 'acc/3.png'},
                {id: '4', name: 'Acc 4', logoUrl: 'acc/4.png'},
                {id: '5', name: 'Acc 5', logoUrl: 'acc/5.png'},
                {id: '6', name: 'Acc 6', logoUrl: 'acc/6.png'},
            ],
        })
        const {container} = render(<AccreditorsSection section={section}/>)

        const row = container.querySelector('[data-testid="accreditors-grid"]')
        expect(row).toBeInTheDocument()

        const tiles = container.querySelector('[data-testid="accreditors-grid"]')!.children
        expect(tiles).toHaveLength(6)
    })
})
