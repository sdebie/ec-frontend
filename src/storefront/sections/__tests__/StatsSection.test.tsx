import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import fc from 'fast-check'
import type {StatsSectionConfig} from '@/shared/types/StorefrontConfig'
import {StatsSection} from '../StatsSection'

const baseSection: StatsSectionConfig = {
    id: 'stats-1',
    type: 'stats',
    props: {
        title: 'Our Numbers',
        eyebrow: 'Company Stats',
        items: [
            {value: '48h', label: 'Average dispatch turnaround'},
            {value: 'SA + Africa', label: 'Nationwide delivery'},
            {value: 'One supplier', label: 'PPE, cleaning, hygiene'},
        ],
    },
}

function renderStats(overrides: Partial<StatsSectionConfig['props']> = {}) {
    const section: StatsSectionConfig = {
        ...baseSection,
        props: {...baseSection.props, ...overrides},
    }
    return render(<StatsSection section={section}/>)
}

describe('StatsSection', () => {
    describe('Section frame', () => {
        it('outer <section> has standard rhythm classes', () => {
            const {container} = renderStats()
            const section = container.querySelector('section')!

            expect(section).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('inner container has mx-auto max-w-6xl', () => {
            const {container} = renderStats()
            const section = container.querySelector('section')!
            const inner = section.firstElementChild as HTMLElement

            expect(inner).toHaveClass('mx-auto', 'max-w-6xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders h2 with title when title is provided', () => {
            renderStats({title: 'Our Numbers'})

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Our Numbers')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('does not render h2 when title is absent', () => {
            renderStats({title: undefined, eyebrow: undefined})

            expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument()
        })

        it('renders eyebrow with uppercase tracking-widest when title and eyebrow are given', () => {
            renderStats({title: 'Our Numbers', eyebrow: 'Company Stats'})

            const eyebrow = screen.getByText('Company Stats')
            expect(eyebrow).toHaveClass('uppercase', 'tracking-widest')
        })

        it('does not render eyebrow when title is absent even if eyebrow is provided', () => {
            renderStats({title: undefined, eyebrow: 'Company Stats'})

            expect(screen.queryByText('Company Stats')).not.toBeInTheDocument()
        })
    })

    describe('dark variant', () => {
        it('section has data-variant="dark" when variant is "dark"', () => {
            const {container} = renderStats({variant: 'dark'})
            const section = container.querySelector('section')!

            expect(section).toHaveAttribute('data-variant', 'dark')
        })

        it('section does NOT have data-variant attribute when variant is "light"', () => {
            const {container} = renderStats({variant: 'light'})
            const section = container.querySelector('section')!

            expect(section).not.toHaveAttribute('data-variant')
        })

        it('section does NOT have data-variant attribute when variant is undefined', () => {
            const {container} = renderStats({variant: undefined})
            const section = container.querySelector('section')!

            expect(section).not.toHaveAttribute('data-variant')
        })

        it('value elements have in-data-[variant=dark]:text-inherit class', () => {
            const {container} = renderStats({variant: 'dark'})
            const grid = container.querySelector('.grid')!
            const values = grid.querySelectorAll('p.text-3xl.font-bold')

            expect(values.length).toBe(3)
            values.forEach((el) => {
                expect(el).toHaveClass('in-data-[variant=dark]:text-inherit')
            })
        })

        it('label elements have in-data-[variant=dark]:text-white/70 class', () => {
            const {container} = renderStats({variant: 'dark'})
            const labels = container.querySelectorAll('.text-sm')

            expect(labels.length).toBe(3)
            labels.forEach((el) => {
                expect(el).toHaveClass('in-data-[variant=dark]:text-white/70')
            })
        })

        it('grid div has in-data-[variant=dark]:divide-white/15 class', () => {
            const {container} = renderStats({variant: 'dark'})
            const grid = container.querySelector('.grid')!

            expect(grid).toHaveClass('in-data-[variant=dark]:divide-white/15')
        })
    })

    describe('null-on-empty', () => {
        it('renders nothing when items is empty', () => {
            const {container} = renderStats({items: []})

            expect(container.innerHTML).toBe('')
        })
    })

    describe('grid layout', () => {
        it('applies responsive grid and divide classes', () => {
            const {container} = renderStats()
            const grid = container.querySelector('.grid')!

            expect(grid).toHaveClass('grid-cols-1')
            expect(grid).toHaveClass('sm:grid-cols-2')
            expect(grid).toHaveClass('lg:grid-cols-3')
            expect(grid).toHaveClass('divide-y')
            expect(grid).toHaveClass('sm:divide-x')
        })
    })

    // Property 4: Stats section renders all items
    it('property: renders every item value and label for any non-empty StatItem array', () => {
        const statItemArb = fc.record({
            value: fc.string({minLength: 1, maxLength: 20}),
            label: fc.string({minLength: 1, maxLength: 40}),
        })

        fc.assert(
            fc.property(
                fc.array(statItemArb, {minLength: 1, maxLength: 10}),
                (items) => {
                    const section: StatsSectionConfig = {
                        id: 'prop-test',
                        type: 'stats',
                        props: {items},
                    }
                    const {container, unmount} = render(<StatsSection section={section}/>)

                    for (const item of items) {
                        expect(container.textContent).toContain(item.value)
                        expect(container.textContent).toContain(item.label)
                    }

                    unmount()
                },
            ),
            {numRuns: 100},
        )
    })
})
