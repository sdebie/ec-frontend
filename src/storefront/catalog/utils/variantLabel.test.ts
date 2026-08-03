import {describe, expect, it} from 'vitest'
import {parseVariantLabel} from './variantLabel'

describe('parseVariantLabel', () => {
    it('formats a JSON object into "Key: Value, Key: Value"', () => {
        const input = '{"Size":"Large","Color":"Red"}'
        expect(parseVariantLabel(input)).toBe('Size: Large, Color: Red')
    })

    it('returns the raw string for non-object JSON (number)', () => {
        const input = '42'
        expect(parseVariantLabel(input)).toBe('42')
    })

    it('returns the raw string for non-object JSON (array)', () => {
        const input = '["a","b"]'
        expect(parseVariantLabel(input)).toBe('["a","b"]')
    })

    it('returns the raw string for invalid JSON', () => {
        const input = 'not-json'
        expect(parseVariantLabel(input)).toBe('not-json')
    })

    it('returns empty string for empty input', () => {
        expect(parseVariantLabel('')).toBe('')
    })
})
