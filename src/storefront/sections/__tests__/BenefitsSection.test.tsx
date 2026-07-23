import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
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

    describe('grid layout (count-aware — no orphaned card on desktop)', () => {
        function benefitItems(count: number) {
            return Array.from({length: count}, (_, i) => ({
                title: `Benefit ${i + 1}`,
                description: `Description ${i + 1}`,
            }))
        }

        function gridEl(count: number) {
            const {container} = render(
                <BenefitsSection section={buildSection({items: benefitItems(count)})}/>,
            )
            return container.querySelector('.grid')
        }

        it('uses 4 desktop columns when the item count divides by 4', () => {
            expect(gridEl(4)).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4')
            expect(gridEl(8)).toHaveClass('lg:grid-cols-4')
        })

        it('uses 3 desktop columns for counts not divisible by 4', () => {
            expect(gridEl(3)).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
            expect(gridEl(6)).toHaveClass('lg:grid-cols-3')
        })

        it('stays at 2 columns for 2 or fewer items', () => {
            const el = gridEl(2)
            expect(el).toHaveClass('sm:grid-cols-2')
            expect(el).not.toHaveClass('lg:grid-cols-3', 'lg:grid-cols-4')
        })

        it('an explicit columns prop overrides the count-derived layout', () => {
            const {container} = render(
                <BenefitsSection
                    section={buildSection({
                        columns: 2,
                        items: benefitItems(4),
                    })}
                />,
            )
            const el = container.querySelector('.grid')
            expect(el).toHaveClass('sm:grid-cols-2')
            expect(el).not.toHaveClass('lg:grid-cols-4')
        })
    })

    describe('icon placement', () => {
        it('renders icon and title on one line when iconPlacement is inline', () => {
            const {container} = render(
                <BenefitsSection
                    section={buildSection({
                        iconPlacement: 'inline',
                        items: [{title: 'PPE', description: 'Desc', icon: 'hard-hat'}],
                    })}
                />,
            )
            const row = container.querySelector('.flex.items-center.gap-2')
            expect(row).toBeInTheDocument()
            expect(row?.querySelector('svg')).toBeInTheDocument()
            expect(row?.querySelector('h3')).toHaveTextContent('PPE')
        })

        it('keeps the stacked icon-above-title layout by default', () => {
            const {container} = render(
                <BenefitsSection
                    section={buildSection({
                        items: [{title: 'PPE', description: 'Desc', icon: 'hard-hat'}],
                    })}
                />,
            )
            expect(container.querySelector('.flex.items-center.gap-2')).not.toBeInTheDocument()
            expect(container.querySelector('svg')?.className.baseVal).toContain('mb-2')
        })
    })

    describe('dark variant', () => {
        it('applies data-variant and dark-inheritance card classes only when variant is dark', () => {
            const {container: darkC} = render(
                <BenefitsSection section={buildSection({variant: 'dark'})}/>,
            )
            expect(darkC.querySelector('section')).toHaveAttribute('data-variant', 'dark')
            expect(darkC.querySelector('article')?.className).toContain('in-data-[variant=dark]:bg-white/5')

            const {container: lightC} = render(<BenefitsSection section={buildSection()}/>)
            expect(lightC.querySelector('section')).not.toHaveAttribute('data-variant')
        })
    })

    describe('footnote', () => {
        it('renders inline text and link segments after the grid', () => {
            render(
                <MemoryRouter>
                    <BenefitsSection
                        section={buildSection({
                            footnote: [
                                {text: 'For enquiries, visit our '},
                                {text: 'Wholesale', to: '/wholesale-application'},
                                {text: ' page or '},
                                {text: 'contact us', to: '/contact-us'},
                                {text: '.'},
                            ],
                        })}
                    />
                </MemoryRouter>,
            )

            const wholesale = screen.getByRole('link', {name: 'Wholesale'})
            expect(wholesale).toHaveAttribute('href', '/wholesale-application')
            expect(screen.getByRole('link', {name: 'contact us'})).toHaveAttribute('href', '/contact-us')
            expect(screen.getByText(/For enquiries, visit our/)).toBeInTheDocument()
        })

        it('renders no footnote element when the prop is absent', () => {
            const {container} = render(<BenefitsSection section={buildSection()}/>)
            expect(container.querySelectorAll('section > div > p')).toHaveLength(0)
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
