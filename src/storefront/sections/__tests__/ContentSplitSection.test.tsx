import {fireEvent, render, screen} from '@testing-library/react'
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
    describe('Section frame', () => {
        it('renders inside a <section> with standardized rhythm classes', () => {
            const {container} = renderSplit()

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-5xl', () => {
            const {container} = renderSplit()

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-5xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold (unconditional — title is required)', () => {
            renderSplit()

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Our Story')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            const sectionWithEyebrow: ContentSplitSectionConfig = {
                ...baseSection,
                props: {...baseSection.props, eyebrow: 'About Us'},
            }
            renderSplit(sectionWithEyebrow)

            expect(screen.getByText('About Us')).toBeInTheDocument()
            expect(screen.getByText('About Us')).toHaveClass('uppercase', 'tracking-widest')
        })
    })

    describe('image position', () => {
        it('defaults imagePosition to left (no md:order-2 on image wrapper)', () => {
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
    })

    describe('image fallback', () => {
        it('collapses to text-only layout when image fails to load', () => {
            const {container} = renderSplit()

            // Image initially present
            const img = container.querySelector('img')
            expect(img).toBeInTheDocument()

            // Simulate load failure
            fireEvent.error(img!)

            // After error: no image, no grid-cols-2, paragraphs full-width (no prose cap)
            expect(container.querySelector('img')).not.toBeInTheDocument()
            expect(container.querySelector('.md\\:grid-cols-2')).not.toBeInTheDocument()
            expect(container.querySelector('.max-w-prose')).not.toBeInTheDocument()
            expect(container.querySelector('.space-y-4')).toBeInTheDocument()
        })
    })

    describe('no-image layout', () => {
        it('renders text-only full-width when imageUrl is absent (no img, no grid-cols-2, no prose cap)', () => {
            const sectionNoImage: ContentSplitSectionConfig = {
                ...baseSection,
                props: {
                    title: 'Text Only',
                    paragraphs: ['A paragraph.'],
                },
            }
            const {container} = renderSplit(sectionNoImage)

            expect(container.querySelector('img')).not.toBeInTheDocument()
            expect(container.querySelector('.md\\:grid-cols-2')).not.toBeInTheDocument()
            expect(container.querySelector('.max-w-prose')).not.toBeInTheDocument()
            expect(container.querySelector('.space-y-4')).toBeInTheDocument()
        })
    })

    describe('null-on-empty', () => {
        it('renders nothing when paragraphs is empty', () => {
            const sectionEmpty: ContentSplitSectionConfig = {
                ...baseSection,
                props: {...baseSection.props, paragraphs: []},
            }
            const {container} = renderSplit(sectionEmpty)

            expect(container.innerHTML).toBe('')
        })
    })

    describe('image rendering', () => {
        it('renders image with resolved URL and loading="lazy"', () => {
            const {container} = renderSplit()

            const img = container.querySelector('img')!
            expect(img).toHaveAttribute('src', '/static/images/about/company.jpg')
            expect(img).toHaveAttribute('loading', 'lazy')
        })
    })

    // Property: Content-split section renders all text content
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
