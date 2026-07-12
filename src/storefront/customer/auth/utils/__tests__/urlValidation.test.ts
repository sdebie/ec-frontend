import {describe, expect, it} from 'vitest'
import {isRelativePath} from '../urlValidation.ts'

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
})
