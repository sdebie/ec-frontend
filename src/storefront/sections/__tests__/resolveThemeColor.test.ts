import {describe, expect, it} from 'vitest'
import {resolveThemeColor} from '../CategoryShowcaseSection'

describe('resolveThemeColor', () => {
    it('returns valid 6-char hex with leading # unchanged', () => {
        expect(resolveThemeColor('#1a3a5c')).toBe('#1a3a5c')
    })

    it('returns valid 6-char hex without leading # with # prepended', () => {
        expect(resolveThemeColor('1a3a5c')).toBe('#1a3a5c')
    })

    it('preserves original case of hex digits', () => {
        expect(resolveThemeColor('#AaBbCc')).toBe('#AaBbCc')
        expect(resolveThemeColor('FfEeDd')).toBe('#FfEeDd')
    })

    it('returns default #6b7280 for empty string', () => {
        expect(resolveThemeColor('')).toBe('#6b7280')
    })

    it('returns default #6b7280 for string with fewer than 6 hex chars', () => {
        expect(resolveThemeColor('#1a3')).toBe('#6b7280')
        expect(resolveThemeColor('abc')).toBe('#6b7280')
    })

    it('returns default #6b7280 for string with more than 6 hex chars', () => {
        expect(resolveThemeColor('#1a3a5c7e')).toBe('#6b7280')
        expect(resolveThemeColor('1a3a5c7e')).toBe('#6b7280')
    })

    it('returns default #6b7280 for string with non-hex characters', () => {
        expect(resolveThemeColor('#gghhii')).toBe('#6b7280')
        expect(resolveThemeColor('zzzzzz')).toBe('#6b7280')
        expect(resolveThemeColor('#1a3g5c')).toBe('#6b7280')
    })
})
