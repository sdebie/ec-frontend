import {describe, expect, it} from 'vitest'
import {buildGradientBackground} from '../CategoryShowcaseSection'

describe('buildGradientBackground', () => {
    describe('with ≥ 2 gradient colors', () => {
        it('produces correct linear-gradient with a 2-stop array', () => {
            const result = buildGradientBackground(['#ff0000', '#0000ff'], '#fallback')
            expect(result).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)')
        })

        it('produces stops at 0%, 50%, 100% with a 3-stop array', () => {
            const result = buildGradientBackground(
                ['rgba(14,165,233,1)', 'rgba(29,78,216,1)', 'rgba(2,6,23,1)'],
                '#6b7280'
            )
            expect(result).toBe(
                'linear-gradient(90deg, rgba(14,165,233,1) 0%, rgba(29,78,216,1) 50%, rgba(2,6,23,1) 100%)'
            )
        })

        it('produces stops at 0%, 33%, 67%, 100% with a 4-stop array', () => {
            const result = buildGradientBackground(
                ['#aaa', '#bbb', '#ccc', '#ddd'],
                '#fallback'
            )
            expect(result).toBe(
                'linear-gradient(90deg, #aaa 0%, #bbb 33%, #ccc 67%, #ddd 100%)'
            )
        })
    })

    describe('fallback cases', () => {
        it('returns the fallback colour when gradientColors is undefined', () => {
            const result = buildGradientBackground(undefined, '#1a3a5c')
            expect(result).toBe('#1a3a5c')
        })

        it('returns the fallback colour when gradientColors is an empty array', () => {
            const result = buildGradientBackground([], '#abcdef')
            expect(result).toBe('#abcdef')
        })

        it('returns the fallback colour when gradientColors has a single element', () => {
            const result = buildGradientBackground(['#ff0000'], '#6b7280')
            expect(result).toBe('#6b7280')
        })
    })
})
