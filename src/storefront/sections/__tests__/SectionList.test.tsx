import {render, screen} from '@testing-library/react'
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import fc from 'fast-check'
import type {SectionConfig, BenefitsSectionConfig, StatsSectionConfig} from '@/shared/types/StorefrontConfig'
import {SectionList} from '../SectionList'
import {sectionRegistry} from '../sectionRegistry'

// --- Helpers ---

/**
 * Wraps children in MemoryRouter (required by sections that use <Link>).
 */
function renderSectionList(sections: SectionConfig[] | undefined) {
    return render(
        <MemoryRouter>
            <SectionList sections={sections}/>
        </MemoryRouter>
    )
}

// --- Example-based unit tests ---

describe('SectionList', () => {
    describe('order preservation', () => {
        it('renders known sections in the same order as the input array', () => {
            const sections: SectionConfig[] = [
                {
                    id: 'benefits-1',
                    type: 'benefits',
                    props: {title: 'First Section', items: [{title: 'Item A', description: 'Desc A'}]},
                } as BenefitsSectionConfig,
                {
                    id: 'stats-1',
                    type: 'stats',
                    props: {title: 'Second Section', items: [{value: '99%', label: 'Uptime'}]},
                } as StatsSectionConfig,
                {
                    id: 'benefits-2',
                    type: 'benefits',
                    props: {title: 'Third Section', items: [{title: 'Item B', description: 'Desc B'}]},
                } as BenefitsSectionConfig,
            ]

            const {container} = renderSectionList(sections)

            const renderedSections = container.querySelectorAll('section')
            expect(renderedSections).toHaveLength(3)

            // Verify order by checking heading text
            expect(renderedSections[0]).toHaveTextContent('First Section')
            expect(renderedSections[1]).toHaveTextContent('Second Section')
            expect(renderedSections[2]).toHaveTextContent('Third Section')
        })
    })

    describe('unknown type renders nothing + DEV warning', () => {
        let consoleWarnSpy: ReturnType<typeof vi.spyOn>

        beforeEach(() => {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        })

        afterEach(() => {
            consoleWarnSpy.mockRestore()
        })

        it('skips a section with an unknown type and logs a DEV warning', () => {
            const sections: SectionConfig[] = [
                {
                    id: 'benefits-good',
                    type: 'benefits',
                    props: {title: 'Good Section', items: [{title: 'Item', description: 'Desc'}]},
                } as BenefitsSectionConfig,
                {
                    id: 'unknown-1',
                    type: 'nonexistent' as SectionConfig['type'],
                    props: {},
                } as unknown as SectionConfig,
            ]

            const {container} = renderSectionList(sections)

            // Only the known section renders
            const renderedSections = container.querySelectorAll('section')
            expect(renderedSections).toHaveLength(1)
            expect(renderedSections[0]).toHaveTextContent('Good Section')

            // DEV warning logged
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Unknown section type: "nonexistent"')
            )
        })
    })

    describe('error boundary isolates a throwing section', () => {
        let consoleErrorSpy: ReturnType<typeof vi.spyOn>

        beforeEach(() => {
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        })

        afterEach(() => {
            consoleErrorSpy.mockRestore()
        })

        it('renders other sections when one section throws', () => {
            // Temporarily replace a registry entry with a throwing component
            const originalComponent = sectionRegistry['benefits']
            sectionRegistry['benefits'] = (() => {
                throw new Error('Section crashed!')
            }) as unknown as typeof originalComponent

            const sections: SectionConfig[] = [
                {
                    id: 'broken-section',
                    type: 'benefits',
                    props: {title: 'Broken', items: [{title: 'X', description: 'Y'}]},
                } as BenefitsSectionConfig,
                {
                    id: 'stats-safe',
                    type: 'stats',
                    props: {items: [{value: '100', label: 'Score'}]},
                } as StatsSectionConfig,
            ]

            const {container} = renderSectionList(sections)

            // The stats section still renders
            expect(screen.getByText('100')).toBeInTheDocument()
            expect(screen.getByText('Score')).toBeInTheDocument()

            // The error boundary rendered the fallback div instead of crashing the tree
            const fallback = container.querySelector('div.min-h-\\[100px\\]')
            expect(fallback).toBeInTheDocument()

            // Restore the original component
            sectionRegistry['benefits'] = originalComponent
        })
    })

    describe('undefined sections renders empty', () => {
        it('renders nothing and does not crash when sections is undefined', () => {
            const {container} = renderSectionList(undefined)

            const renderedSections = container.querySelectorAll('section')
            expect(renderedSections).toHaveLength(0)
        })
    })

    // Feature: about-page, Property 3: Section list ordering and type filtering
    describe('Property 3: ordering and type filtering (fast-check)', () => {
        /**
         * Strategy: generate random section arrays mixing types that ARE in the
         * registry (config-embedded types with guaranteed-rendering props) and types
         * that are NOT in the registry (unknown strings). Verify:
         * 1. Rendered section count equals the number of known-type entries in the input
         * 2. Order is preserved (verified by data-testid-like content matching)
         * 3. No duplicates (count check covers this)
         *
         * We restrict known types to simple, config-embedded ones that always render
         * a <section> element with valid minimal props and do not require QueryClient:
         * - benefits (renders with title + items)
         * - stats (renders with non-empty items)
         * - cta (renders with title + cta link)
         */
        const reliableKnownTypes = ['benefits', 'stats', 'cta'] as const
        const unknownTypes = ['unknown-a', 'unknown-b', 'fake-section', 'nonexistent', 'does-not-exist'] as const

        function buildSectionForType(type: string, id: string): SectionConfig {
            switch (type) {
                case 'benefits':
                    return {id, type: 'benefits', props: {title: `BEN-${id}`, items: [{title: 'Item', description: 'Desc'}]}} as SectionConfig
                case 'stats':
                    return {id, type: 'stats', props: {items: [{value: 'V', label: `STAT-${id}`}]}} as SectionConfig
                case 'cta':
                    return {id, type: 'cta', props: {title: `CTA-${id}`, cta: {label: 'Go', to: '/test'}}} as SectionConfig
                default:
                    // Unknown type — props don't matter since it won't render
                    return {id, type, props: {}} as unknown as SectionConfig
            }
        }

        it('renders exactly the known-type sections in their original order, with no extras or reorderings', () => {
            // Suppress console.warn for unknown types during property test
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

            try {
                fc.assert(
                    fc.property(
                        fc.array(
                            fc.record({
                                id: fc.uuid(),
                                type: fc.oneof(
                                    {weight: 3, arbitrary: fc.constantFrom(...reliableKnownTypes)},
                                    {weight: 2, arbitrary: fc.constantFrom(...unknownTypes)}
                                ),
                            }),
                            {minLength: 0, maxLength: 12}
                        ),
                        (sectionSpecs) => {
                            const sections = sectionSpecs.map((spec) =>
                                buildSectionForType(spec.type, spec.id)
                            )

                            const {container, unmount} = render(
                                <MemoryRouter>
                                    <SectionList sections={sections}/>
                                </MemoryRouter>
                            )

                            // Expected: only entries whose type is a reliable known type
                            const expectedKnown = sectionSpecs.filter((s) =>
                                (reliableKnownTypes as readonly string[]).includes(s.type)
                            )

                            // All reliable known types render a <section> element
                            const renderedSections = container.querySelectorAll('section')

                            // Property: count of rendered sections equals count of known-type input entries
                            expect(renderedSections.length).toBe(expectedKnown.length)

                            // Property: order is preserved — verify sequential content markers
                            expectedKnown.forEach((spec, index) => {
                                const sectionEl = renderedSections[index]
                                // Each section contains its unique marker
                                if (spec.type === 'benefits') {
                                    expect(sectionEl.textContent).toContain(`BEN-${spec.id}`)
                                } else if (spec.type === 'stats') {
                                    expect(sectionEl.textContent).toContain(`STAT-${spec.id}`)
                                } else if (spec.type === 'cta') {
                                    expect(sectionEl.textContent).toContain(`CTA-${spec.id}`)
                                }
                            })

                            unmount()
                        }
                    ),
                    {numRuns: 120}
                )
            } finally {
                warnSpy.mockRestore()
            }
        })
    })
})
