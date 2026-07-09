import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {CategoryPreviewSectionConfig} from '@/shared/types/StorefrontConfig'
import {CategoryPreviewSection} from './CategoryPreviewSection'

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
