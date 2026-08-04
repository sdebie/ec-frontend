import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {describe, expect, it, vi} from 'vitest'
import type {PromoGridSectionConfig} from '@/shared/types/StorefrontConfig'
import {PromoGridSection} from '../PromoGridSection'

vi.mock('@/shared/utils/imageUrl', () => ({
    resolveImageUrl: (path: string | null | undefined) =>
        path ? `/static/images/${path}` : null,
}))

function buildSection(overrides: Partial<PromoGridSectionConfig['props']> = {}): PromoGridSectionConfig {
    return {
        id: 'promo-grid-1',
        type: 'promo-grid',
        props: {
            title: 'Shop by Industry',
            items: [
                {id: 'item-1', title: 'PPE', description: 'Protective equipment', cta: {label: 'Browse', to: '/products?category=ppe'}},
                {id: 'item-2', title: 'Medical', description: 'Medical supplies', cta: {label: 'Browse', to: '/products?category=medical'}},
                {id: 'item-3', title: 'Cleaning', description: 'Cleaning products'},
            ],
            ...overrides,
        },
    }
}

function renderSection(section: PromoGridSectionConfig = buildSection()) {
    return render(
        <MemoryRouter>
            <PromoGridSection section={section}/>
        </MemoryRouter>,
    )
}

describe('PromoGridSection', () => {
    describe('Section frame', () => {
        it('renders inside a <section> element with standardized rhythm classes', () => {
            const {container} = renderSection()

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-6xl', () => {
            const {container} = renderSection()

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-6xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold', () => {
            renderSection()

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Shop by Industry')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            renderSection(buildSection({eyebrow: 'Categories'}))

            expect(screen.getByText('Categories')).toBeInTheDocument()
            expect(screen.getByText('Categories')).toHaveClass('uppercase', 'tracking-widest')
        })

        it('renders subtitle when provided', () => {
            renderSection(buildSection({subtitle: 'Find what you need'}))

            expect(screen.getByText('Find what you need')).toBeInTheDocument()
        })
    })

    describe('grid tiles', () => {
        it('renders cards in a centering flex-wrap row (incomplete rows center themselves)', () => {
            const {container} = renderSection()

            const row = container.querySelector('.flex.flex-wrap')
            expect(row).toBeInTheDocument()
            expect(row).toHaveClass('justify-center')
            const card = row!.querySelector('article')
            expect(card).toHaveClass('lg:basis-[calc((100%-2rem)/3)]')
        })

        it('applies compact rhythm and a heading icon when configured', () => {
            const {container} = renderSection(buildSection({compact: true, icon: 'package'}))

            expect(container.querySelector('section')).toHaveClass('py-8')
            expect(container.querySelector('h2 svg')).toBeInTheDocument()
        })

        it('keeps a real grid for the feature-first layout (col-span support)', () => {
            const {container} = renderSection(buildSection({layout: 'feature-first'}))
            expect(container.querySelector('.grid')).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
        })

        it('renders tile titles', () => {
            renderSection()

            expect(screen.getByText('PPE')).toBeInTheDocument()
            expect(screen.getByText('Medical')).toBeInTheDocument()
            expect(screen.getByText('Cleaning')).toBeInTheDocument()
        })

        it('renders CTA links when present on items', () => {
            renderSection()

            const links = screen.getAllByRole('link')
            expect(links).toHaveLength(2) // Only items 1 and 2 have CTAs
            expect(links[0]).toHaveAttribute('href', '/products?category=ppe')
            expect(links[1]).toHaveAttribute('href', '/products?category=medical')
        })

        it('renders item image when imageUrl is provided', () => {
            const section = buildSection({
                items: [
                    {id: 'item-1', title: 'PPE', description: 'Equipment', imageUrl: 'promo/ppe.jpg'},
                ],
            })
            renderSection(section)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('src', '/static/images/promo/ppe.jpg')
            expect(img).toHaveAttribute('alt', 'PPE')
        })

        it('renders text-only tile when imageUrl is absent', () => {
            const section = buildSection({
                items: [
                    {id: 'item-1', title: 'PPE', description: 'Equipment'},
                ],
            })
            const {container} = renderSection(section)

            expect(container.querySelector('img')).not.toBeInTheDocument()
            expect(screen.getByText('PPE')).toBeInTheDocument()
        })

        it('feature-first layout spans first item across 2 columns on lg', () => {
            const section = buildSection({layout: 'feature-first'})
            const {container} = renderSection(section)

            const articles = container.querySelectorAll('article')
            expect(articles[0]).toHaveClass('lg:col-span-2')
        })

        it('collapses tile to text-only when image fails to load', () => {
            const section = buildSection({
                items: [
                    {id: 'item-1', title: 'PPE', description: 'Equipment', imageUrl: 'promo/ppe.jpg'},
                ],
            })
            const {container} = renderSection(section)

            // Image initially present
            const img = container.querySelector('img')
            expect(img).toBeInTheDocument()

            // Simulate load failure
            fireEvent.error(img!)

            // After error: no image, tile shows text-only with p-5 class
            expect(container.querySelector('img')).not.toBeInTheDocument()
            expect(screen.getByText('PPE')).toBeInTheDocument()
        })
    })
})
