import {describe, it, expect} from 'vitest'
import fc from 'fast-check'
import {resolveThemeColor} from '../CategoryShowcaseSection'

/**
 * Validates: Requirements 4.3
 */
describe('Feature: category-showcase-theming, Property 2: Invalid colour input always produces the default fallback', () => {
    const HEX_REGEX = /^[0-9a-fA-F]{6}$/

    // Generator for hex-only strings that are too short (0–5 chars)
    const tooShortHexArb = fc
        .integer({min: 0, max: 5})
        .chain((len) => fc.stringOf(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), {minLength: len, maxLength: len}))

    // Generator for hex-only strings that are too long (7–20 chars)
    const tooLongHexArb = fc
        .integer({min: 7, max: 20})
        .chain((len) => fc.stringOf(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), {minLength: len, maxLength: len}))

    // Generator for exactly 6 chars that contain at least one non-hex character
    const nonHexSixCharArb = fc
        .stringOf(fc.char(), {minLength: 6, maxLength: 6})
        .filter((s) => !HEX_REGEX.test(s))

    // Generator for special character strings
    const specialCharsArb = fc.stringOf(
        fc.constantFrom(...'!@#$%^&*()_+-=[]{}|;:,.<>?/~`'.split('')),
        {minLength: 1, maxLength: 10}
    )

    // Combine all invalid generators with fc.oneof
    const invalidColorArb = fc.oneof(
        tooShortHexArb,
        tooLongHexArb,
        nonHexSixCharArb,
        specialCharsArb,
        fc.constant('') // empty string
    )

    // Optionally prefix with '#'
    const invalidColorWithOptionalHashArb = fc
        .tuple(invalidColorArb, fc.boolean())
        .map(([str, addHash]) => addHash ? `#${str}` : str)
        // Final safety filter: after stripping '#', the value must NOT be a valid 6-char hex
        .filter((input) => {
            const stripped = input.startsWith('#') ? input.slice(1) : input
            return !HEX_REGEX.test(stripped)
        })

    it('returns #6b7280 for any invalid colour input', () => {
        fc.assert(
            fc.property(invalidColorWithOptionalHashArb, (input) => {
                const result = resolveThemeColor(input)
                expect(result).toBe('#6b7280')
            }),
            {numRuns: 100}
        )
    })
})
