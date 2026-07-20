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
        items: [
            {value: '48h', label: 'Average dispatch turnaround'},
            {value: 'SA + Africa', label: 'Nationwide delivery'},
            {value: 'One supplier', label: 'PPE, cleaning, hygiene'},
        ],
    },
}

function renderStats(section: StatsSectionConfig = baseSection) {
    return render(<StatsSection section={section}/>)
}

describe('StatsSection', () => {
    it('renders all item values and labels from props', () => {
        renderStats()

        expect(screen.getByText('48h')).toBeInTheDocument()
        expect(screen.getByText('Average dispatch turnaround')).toBeInTheDocument()
        expect(screen.getByText('SA + Africa')).toBeInTheDocument()
        expect(screen.getByText('Nationwide delivery')).toBeInTheDocument()
        expect(screen.getByText('One supplier')).toBeInTheDocument()
        expect(screen.getByText('PPE, cleaning, hygiene')).toBeInTheDocument()
    })

    it('renders title as h2 when present', () => {
        renderStats()

        const heading = screen.getByRole('heading', {level: 2})
        expect(heading).toHaveTextContent('Our Numbers')
    })

    it('does not render h2 when title is absent', () => {
        const sectionNoTitle: StatsSectionConfig = {
            ...baseSection,
            props: {
                items: baseSection.props.items,
            },
        }
        renderStats(sectionNoTitle)

        expect(screen.queryByRole('heading', {level: 2})).not.toBeInTheDocument()
        // Items still render
        expect(screen.getByText('48h')).toBeInTheDocument()
    })

    it('renders nothing when items is empty', () => {
        const sectionEmpty: StatsSectionConfig = {
            ...baseSection,
            props: {title: 'Empty', items: []},
        }
        const {container} = renderStats(sectionEmpty)

        expect(container.innerHTML).toBe('')
    })

    it('applies responsive one/two/three-column grid classes', () => {
        const {container} = renderStats()

        const grid = container.querySelector('.grid')
        expect(grid).toBeInTheDocument()
        expect(grid).toHaveClass('grid-cols-1')
        expect(grid).toHaveClass('sm:grid-cols-2')
        expect(grid).toHaveClass('lg:grid-cols-3')
    })

    it('separates items with dividers', () => {
        const {container} = renderStats()

        const grid = container.querySelector('.grid')
        expect(grid).toHaveClass('divide-y')
        expect(grid).toHaveClass('sm:divide-x')
    })

    // Feature: about-page, Property 4: Stats section renders all items
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
