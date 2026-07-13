import {render, screen, fireEvent} from '@testing-library/react'
import {AccreditorsSection} from '../AccreditorsSection.tsx'
import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig.ts'
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
    it('renders heading when provided', () => {
        const section = buildSection({heading: 'Our Accreditations'})
        render(<AccreditorsSection section={section}/>)

        expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Our Accreditations')
    })

    it('renders correct number of logos', () => {
        const section = buildSection()
        const {container} = render(<AccreditorsSection section={section}/>)

        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)

        // Verify tile containers exist for each item (new DOM structure)
        const tiles = container.querySelectorAll('.flex.h-20.w-40')
        expect(tiles).toHaveLength(3)
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
        const tile = container.querySelector('.flex.h-20.w-40')
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
        const section = buildSection({items: [], heading: 'Accreditations'})
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

        const tiles = container.querySelectorAll('.flex.h-20.w-40')
        const expectedClasses = ['h-20', 'w-40', 'sm:h-24', 'sm:w-48', 'lg:h-28', 'lg:w-56']

        tiles.forEach((tile) => {
            expectedClasses.forEach((cls) => {
                expect(tile).toHaveClass(cls)
            })
        })
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

        const row = container.querySelector('.flex-wrap.justify-center')
        expect(row).toBeInTheDocument()

        const tiles = container.querySelectorAll('.flex.h-20.w-40')
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

        const row = container.querySelector('.flex-wrap.justify-center')
        expect(row).toBeInTheDocument()

        const tiles = container.querySelectorAll('.flex.h-20.w-40')
        expect(tiles).toHaveLength(6)
    })
})
