import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { toSlug } from '@/admin/utils/slug'

/**
 * Property 1: Slug generation produces valid URL-safe strings
 *
 * For any input string (including unicode, mixed case, special characters, and whitespace),
 * the toSlug function SHALL produce a string matching /^[a-z0-9-]*$/ — containing only
 * lowercase letters, digits, and hyphens — and SHALL never start or end with a hyphen.
 *
 */

describe('toSlug — Property 1: Slug generation produces valid URL-safe strings', () => {
  it('result contains only lowercase letters, digits, and hyphens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (name) => {
          const slug = toSlug(name)
          expect(slug).toMatch(/^[a-z0-9-]*$/)
        },
      ),
      { numRuns: 500 },
    )
  })

  it('result has no leading hyphen', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (name) => {
          const slug = toSlug(name)
          if (slug.length > 0) {
            expect(slug.startsWith('-')).toBe(false)
          }
        },
      ),
      { numRuns: 500 },
    )
  })

  it('result has no trailing hyphen', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (name) => {
          const slug = toSlug(name)
          if (slug.length > 0) {
            expect(slug.endsWith('-')).toBe(false)
          }
        },
      ),
      { numRuns: 500 },
    )
  })

  it('function is deterministic — same input always produces same output', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (name) => {
          expect(toSlug(name)).toBe(toSlug(name))
        },
      ),
      { numRuns: 500 },
    )
  })
})
