import {describe, it, expect} from 'vitest'
import fc from 'fast-check'
import {buildGradientBackground} from '../CategoryShowcaseSection'

/**
 * Validates: Requirements 1.1, 1.2, 2.3
 */
describe('Feature: category-showcase-theming, Property 1: Gradient construction preserves all colour stops at correct positions', () => {
    // Generator for hex colour strings (#rrggbb format)
    const hexCharArb = fc.constantFrom(
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f'
    )
    const hexColorArb = fc
        .array(hexCharArb, {minLength: 6, maxLength: 6})
        .map((chars) => `#${chars.join('')}`)

    // Generator for arrays of 2–10 hex colours
    const gradientColorsArb = fc.array(hexColorArb, {minLength: 2, maxLength: 10})

    // Generator for a random fallback string
    const fallbackArb = hexColorArb

    it('preserves all colour stops at correct positions', () => {
        fc.assert(
            fc.property(gradientColorsArb, fallbackArb, (colors, fallback) => {
                const result = buildGradientBackground(colors, fallback)
                const count = colors.length

                // Assertion 1: Result starts with `linear-gradient(90deg, `
                expect(result.startsWith('linear-gradient(90deg, ')).toBe(true)

                // Assertion 2: Every colour from the input array appears in the output
                for (const color of colors) {
                    expect(result).toContain(color)
                }

                // Assertion 3: Each stop is positioned at the correct percentage
                for (let i = 0; i < count; i++) {
                    const expectedPosition = Math.round((100 / (count - 1)) * i)
                    const expectedStop = `${colors[i]} ${expectedPosition}%`
                    expect(result).toContain(expectedStop)
                }
            }),
            {numRuns: 100}
        )
    })
})
