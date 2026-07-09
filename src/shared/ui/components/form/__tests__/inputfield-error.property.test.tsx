import { describe, it, expect } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { InputField } from '../InputField'

/**
 * **Validates: Requirements 2.7**
 *
 * Property 3: InputField error display
 * For any non-empty error string passed to InputField, the rendered output
 * SHALL contain that exact string in the DOM and SHALL apply the `error`
 * variant to the inner Input element.
 */

const nonEmptyStringArbitrary = fc.string({ minLength: 1 }).filter(
  (s) => s.trim().length > 0
)

describe('InputField — Property: InputField error display', () => {
  it('for any non-empty error string, the error appears in the DOM and the inner Input has the error variant class', () => {
    fc.assert(
      fc.property(nonEmptyStringArbitrary, (errorMessage) => {
        cleanup()

        const { container, getByRole } = render(
          <InputField error={errorMessage} />
        )

        // Assert: the error string appears in the rendered DOM via role="alert"
        const alert = getByRole('alert')
        expect(alert.textContent).toBe(errorMessage)

        // Assert: the inner <input> element has the error variant class
        const input = container.querySelector('input')!
        expect(input.className).toContain('border-(--c-error)')
      }),
      { numRuns: 100 }
    )
  })
})
