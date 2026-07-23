import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {CategoryPreviewSectionConfig} from '@/shared/types/StorefrontConfig.ts'
import {CategoryPreviewSection} from '../CategoryPreviewSection.tsx'

const baseSection: CategoryPreviewSectionConfig = {
    id: 'cat-preview-1',
    type: 'category-preview',
    props: {
        title: 'Shop by Category',
        items: [
            {
                id: '1',
                label: 'Electronics',
                to: '/categories/electronics',
                imageSrc: '/img/electronics.jpg',
                imageAlt: 'Electronics category'
            },
            {id: '2', label: 'Clothing', to: '/categories/clothing', imageSrc: '/img/clothing.jpg'},
            {id: '3', label: 'Home & Garden', to: '/categories/home'},
        ],
    },
}

function renderSection(section: CategoryPreviewSectionConfig = baseSection) {
    return render(
        <MemoryRouter>
            <CategoryPreviewSection section={section}/>
        </MemoryRouter>
    )
}

describe('CategoryPreviewSection', () => {
    describe('Section frame', () => {
        it('renders inside a <section> element with standardized rhythm classes', () => {
            const {container} = renderSection()
            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-5xl', () => {
            const {container} = renderSection()
            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-5xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold via SectionHeading', () => {
            renderSection()
            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Shop by Category')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })
    })

    describe('tiles layout', () => {
        it('renders a grid container with the default grid-cols-3 class', () => {
            const {container} = renderSection()
            const grid = container.querySelector('.grid')
            expect(grid).toBeInTheDocument()
            expect(grid).toHaveClass('grid-cols-3')
        })

        it('renders a grid container with grid-cols matching the columns prop', () => {
            const section: CategoryPreviewSectionConfig = {
                ...baseSection,
                props: {...baseSection.props, columns: 4},
            }
            const {container} = renderSection(section)
            const grid = container.querySelector('.grid')
            expect(grid).toBeInTheDocument()
            expect(grid).toHaveClass('grid-cols-4')
        })
    })

    describe('list layout', () => {
        it('renders items in a vertical flex-col container', () => {
            const section: CategoryPreviewSectionConfig = {
                ...baseSection,
                props: {...baseSection.props, layout: 'list'},
            }
            const {container} = renderSection(section)
            const list = container.querySelector('.flex-col')
            expect(list).toBeInTheDocument()
        })
    })

    describe('images', () => {
        it('renders images with loading="lazy" attribute', () => {
            renderSection()
            const images = screen.getAllByRole('img')
            images.forEach((img) => {
                expect(img).toHaveAttribute('loading', 'lazy')
            })
        })

        it('uses imageAlt when provided', () => {
            renderSection()
            expect(screen.getByAltText('Electronics category')).toBeInTheDocument()
        })

        it('falls back to item.label when imageAlt is not provided', () => {
            renderSection()
            expect(screen.getByAltText('Clothing')).toBeInTheDocument()
        })
    })

    describe('item links', () => {
        it('renders items as anchor elements with correct href paths', () => {
            renderSection()
            const links = screen.getAllByRole('link')
            const hrefs = links.map((link) => link.getAttribute('href'))
            expect(hrefs).toContain('/categories/electronics')
            expect(hrefs).toContain('/categories/clothing')
            expect(hrefs).toContain('/categories/home')
        })
    })
})
