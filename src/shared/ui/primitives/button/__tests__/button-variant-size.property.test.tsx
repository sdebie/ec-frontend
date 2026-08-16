import {describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {render} from '@testing-library/react'
import {Button} from '../Button'

/**
 * Property 1: Button variant and size class resolution
 *
 * For any valid combination of Button variant (solid | secondary | outline | ghost | plain)
 * and size (sm | md | lg), rendering the Button component SHALL produce an element whose
 * className includes the variant-specific and size-specific CSS classes as defined by the
 * cva configuration.
 *
 */

const variants = ['solid', 'secondary', 'outline', 'ghost', 'plain'] as const
const sizes = ['sm', 'md', 'lg'] as const

type Variant = (typeof variants)[number]
type Size = (typeof sizes)[number]

// Expected classes for each variant (key distinguishing classes from the cva config)
const variantClasses: Record<Variant, string[]> = {
    solid: ['bg-(--c-accent)', 'text-(--c-accent-text)'],
    secondary: ['border', 'border-(--c-border)', 'bg-(--c-panel)', 'text-(--c-text)'],
    outline: ['border', 'border-(--c-border)', 'bg-transparent', 'text-(--c-text)'],
    ghost: ['text-(--c-text)', 'hover:bg-(--c-bg)'],
    plain: ['bg-transparent', 'text-(--c-text-muted)'],
}

// Expected classes for each size
const sizeClasses: Record<Size, string[]> = {
    sm: ['h-(--c-control-h-sm)', 'px-3', 'text-xs'],
    md: ['h-(--c-control-h-md)', 'px-4', 'text-sm'],
    lg: ['h-(--c-control-h-lg)', 'px-6', 'text-base'],
}

// Arbitrariness
const variantArb = fc.constantFrom(...variants)
const sizeArb = fc.constantFrom(...sizes)

describe('Button variant and size class resolution — Property Tests', () => {
    it('rendered className includes variant-specific classes for any valid variant × size combination', () => {
        fc.assert(
            fc.property(variantArb, sizeArb, (variant, size) => {
                const {container} = render(
                    <Button variant={variant} size={size}>
                        Test
                    </Button>,
                )
                const button = container.querySelector('button')!
                const className = button.className

                // Assert variant-specific classes are present
                for (const cls of variantClasses[variant]) {
                    expect(className).toContain(cls)
                }
            }),
            {numRuns: 100},
        )
    })

    it('rendered className includes size-specific classes for any valid variant × size combination', () => {
        fc.assert(
            fc.property(variantArb, sizeArb, (variant, size) => {
                const {container} = render(
                    <Button variant={variant} size={size}>
                        Test
                    </Button>,
                )
                const button = container.querySelector('button')!
                const className = button.className

                // Assert size-specific classes are present
                for (const cls of sizeClasses[size]) {
                    expect(className).toContain(cls)
                }
            }),
            {numRuns: 100},
        )
    })
})
