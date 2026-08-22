import {describe, expect, it} from 'vitest'
import {isRelativePath} from '../urlValidation'

describe('isRelativePath', () => {
    it('returns true for /account', () => {
        expect(isRelativePath('/account')).toBe(true)
    })

    it('returns true for /products/slug', () => {
        expect(isRelativePath('/products/slug')).toBe(true)
    })

    it('returns false for absolute URL https://evil.com', () => {
        expect(isRelativePath('https://evil.com')).toBe(false)
    })

    it('returns false for protocol-relative URL //evil.com', () => {
        expect(isRelativePath('//evil.com')).toBe(false)
    })

    it('returns false for javascript:alert(1)', () => {
        expect(isRelativePath('javascript:alert(1)')).toBe(false)
    })

    it('returns false for empty string', () => {
        expect(isRelativePath('')).toBe(false)
    })

    it('returns false for backslash-leading //evil.com bypass (/\\evil.com)', () => {
        // Browsers normalize a leading `/\` into `//` before resolving, turning
        // this into a protocol-relative navigation to evil.com.
        expect(isRelativePath('/\\evil.com')).toBe(false)
    })

    it('returns false for double-backslash bypass (\\\\evil.com)', () => {
        expect(isRelativePath('\\\\evil.com')).toBe(false)
    })

    it('returns false for backslash-then-slash bypass (\\/evil.com)', () => {
        expect(isRelativePath('\\/evil.com')).toBe(false)
    })

    it('returns false for a tab-obscured protocol-relative bypass (/\\t/evil.com)', () => {
        // Browsers strip ASCII tab/newline before resolving, so this also
        // collapses to `//evil.com` even though no `//` appears literally.
        expect(isRelativePath('/\t/evil.com')).toBe(false)
    })
})
