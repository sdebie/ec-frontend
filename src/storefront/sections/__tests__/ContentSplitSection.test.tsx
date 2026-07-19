import {render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import fc from 'fast-check'
import type {ContentSplitSectionConfig} from '@/shared/types/StorefrontConfig'
import {ContentSplitSection} from '../ContentSplitSection'

vi.mock('@/shared/utils/imageUrl', () => ({
    resolveImageUrl: vi.fn((path: string | null | undefined) => {
        if (!path) return null
        return `/static/images/${path}`
    }),
}))

const baseSection: ContentSplitSectionConfig = {
    id: 'split-1',
    type: 'content-split',
    props: {
        title: 'Our Story',
        paragraphs: [
            'We simplify procurement through a modern platform.',
            'Our mission is to supply what customers need.',
        ],
        imageUrl: 'about/company.jpg',
        imageAlt: 'Company building',
    },
}

function renderSplit(section: ContentSplitSectionConfig = baseSection) {
    return render(<ContentSplitSection section={section}/>)
}

describe('ContentSplitSection', () => {
    it('renders title and all paragraphs from props', () => {
        renderSplit()

        expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Our Story')
        expect(screen.getByText('We simplify procurement through a modern platform.')).toBeInTheDocument()
        expect(screen.getByText('Our mission is to supply what customers need.')).toBeInTheDocument()
    })

    it('renders nothing when paragraphs is empty', () => {
        const sectionEmpty: ContentSplitSectionConfig = {
            ...baseSection,
            props: {...baseSection.props, paragraphs: []},
        }
        const {container} = renderSplit(sectionEmpty)

        expect(container.innerHTML).toBe('')
    })

    it('defaults imagePosition to left (no md:order-2 ancestor)', () => {
        const {container} = renderSplit()

        const img = container.querySelector('img')!
        expect(img.closest('.md\\:order-2')).not.toBeInTheDocument()
    })

    it('applies md:order-2 on the image wrapper when imagePosition is right', () => {
        const sectionRight: ContentSplitSectionConfig = {
            ...baseSection,
            props: {...baseSection.props, imagePosition: 'right'},
        }
        const {container} = renderSplit(sectionRight)

        const img = container.querySelector('img')!
        expect(img.closest('.md\\:order-2')).toBeInTheDocument()
    })

    it('renders the image inside a consistent 4:3 aspect-ratio wrapper', () => {
        const {container} = renderSplit()

        const img = container.querySelector('img')!
        expect(img.closest('.aspect-\\[4\\/3\\]')).toBeInTheDocument()
    })

    it('passes imageUrl through resolveImageUrl', () => {
        const {container} = renderSplit()

        const img = container.querySelector('img')!
        expect(img).toHaveAttribute('src', '/static/images/about/company.jpg')
    })

    it('does not render img element when imageUrl is absent', () => {
        const sectionNoImage: ContentSplitSectionConfig = {
            ...baseSection,
            props: {
                title: 'Text Only',
                paragraphs: ['A paragraph.'],
            },
        }
        const {container} = renderSplit(sectionNoImage)

        expect(container.querySelector('img')).not.toBeInTheDocument()
    })

    it('renders full-width text when no image (no grid-cols-2)', () => {
        const sectionNoImage: ContentSplitSectionConfig = {
            ...baseSection,
            props: {
                title: 'Text Only',
                paragraphs: ['A paragraph.'],
            },
        }
        const {container} = renderSplit(sectionNoImage)

        const wrapper = container.querySelector('.max-w-3xl')
        expect(wrapper).toBeInTheDocument()
        expect(container.querySelector('.md\\:grid-cols-2')).not.toBeInTheDocument()
    })

    // Feature: about-page, Property 5: Content-split section renders all text content
    it('property: renders title and every paragraph for any non-empty title + paragraphs', () => {
        const titleArb = fc.string({minLength: 1, maxLength: 50})
        const paragraphArb = fc.string({minLength: 1, maxLength: 100})
        const paragraphsArb = fc.array(paragraphArb, {minLength: 1, maxLength: 8})

        fc.assert(
            fc.property(titleArb, paragraphsArb, (title, paragraphs) => {
                const section: ContentSplitSectionConfig = {
                    id: 'prop-test',
                    type: 'content-split',
                    props: {title, paragraphs},
                }
                const {container, unmount} = render(<ContentSplitSection section={section}/>)

                expect(container.textContent).toContain(title)
                for (const paragraph of paragraphs) {
                    expect(container.textContent).toContain(paragraph)
                }

                unmount()
            }),
            {numRuns: 100},
        )
    })
})
