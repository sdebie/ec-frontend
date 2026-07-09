import { describe, it, expect } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { Input } from '../Input'

/**
 * **Validates: Requirements 1.7**
 *
 * Property 2: Input size maps to token height
 * For any valid Input size (`sm | md | lg`), rendering the Input component
 * SHALL produce an element that references the corresponding
 * `--c-control-h-{size}` CSS custom property for its height.
 */

const validSizes = ['sm', 'md', 'lg'] as const
type InputSize = (typeof validSizes)[number]

const sizeArbitrary = fc.constantFrom<InputSize>(...validSizes)

describe('Input — Property: Input size maps to token height', () => {
  it('for any valid size, the rendered input references the corresponding --c-control-h-{size} token', () => {
    fc.assert(
      fc.property(sizeArbitrary, (size) => {
        cleanup()

        const { container } = render(<Input size={size} />)
        const input = container.querySelector('input')!

        const expectedClass = `h-(--c-control-h-${size})`
        expect(input.className).toContain(expectedClass)
      }),
      { numRuns: 100 }
    )
  })
})
