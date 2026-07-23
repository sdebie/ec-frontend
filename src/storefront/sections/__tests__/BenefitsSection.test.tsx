import {render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import type {BenefitsSectionConfig} from '@/shared/types/StorefrontConfig'
import {BenefitsSection} from '../BenefitsSection'

function buildSection(overrides: Partial<BenefitsSectionConfig['props']> = {}): BenefitsSectionConfig {
    return {
        id: 'benefits-1',
        type: 'benefits',
        props: {
            title: 'Why Shop With Us',
            items: [
                {title: 'Free Delivery', description: 'On orders over R500'},
                {title: 'Quality Products', description: 'Trusted brands only'},
                {title: 'Fast Service', description: 'Same day dispatch'},
            ],
            ...overrides,
        },
    }
}

describe('BenefitsSection', () => {
    describe('Section frame', () => {
        it('renders inside a <section> element with standardized rhythm classes', () => {
            const {container} = render(<BenefitsSection section={buildSection()}/>)

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-5xl (default width)', () => {
            const {container} = render(<BenefitsSection section={buildSection()}/>)

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-5xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold', () => {
            render(<BenefitsSection section={buildSection()}/>)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Why Shop With Us')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            render(<BenefitsSection section={buildSection({eyebrow: 'Our Promise'})}/>)

            expect(screen.getByText('Our Promise')).toBeInTheDocument()
            expect(screen.getByText('Our Promise')).toHaveClass('uppercase', 'tracking-widest')
        })

        it('does not render eyebrow when absent', () => {
            const {container} = render(<BenefitsSection section={buildSection()}/>)

            // No eyebrow element (the accent dash + text container)
            expect(container.querySelector('.uppercase.tracking-wide')).not.toBeInTheDocument()
        })
    })

    describe('benefit items', () => {
        it('renders all benefit items with title and description', () => {
            render(<BenefitsSection section={buildSection()}/>)

            expect(screen.getByText('Free Delivery')).toBeInTheDocument()
            expect(screen.getByText('On orders over R500')).toBeInTheDocument()
            expect(screen.getByText('Quality Products')).toBeInTheDocument()
            expect(screen.getByText('Fast Service')).toBeInTheDocument()
        })

        it('renders icon when a valid icon name is provided', () => {
            const section = buildSection({
                items: [
                    {title: 'Free Delivery', description: 'On orders over R500', icon: 'truck'},
                ],
            })
            const {container} = render(<BenefitsSection section={section}/>)

            // Icon renders as an SVG with accent color and aria-hidden
            const svg = container.querySelector('svg')
            expect(svg).toBeInTheDocument()
            expect(svg).toHaveAttribute('aria-hidden', 'true')
            expect(svg).toHaveClass('text-(--sf-accent)')
        })

        it('does not render icon slot when icon is absent', () => {
            const section = buildSection({
                items: [
                    {title: 'No Icon Item', description: 'Description'},
                ],
            })
            const {container} = render(<BenefitsSection section={section}/>)

            expect(container.querySelector('svg')).not.toBeInTheDocument()
        })

        it('warns in dev mode for unregistered icon names and renders no icon', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

            const section = buildSection({
                items: [
                    {title: 'Bad Icon', description: 'Desc', icon: 'nonexistent-icon'},
                ],
            })
            const {container} = render(<BenefitsSection section={section}/>)

            expect(container.querySelector('svg')).not.toBeInTheDocument()
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[BenefitsSection] Unknown icon name: "nonexistent-icon"'),
            )

            consoleSpy.mockRestore()
        })
    })
})
