import { describe, it, expect } from 'vitest'

import { maskEmail } from '../maskEmail'

describe('maskEmail', () => {
  it('keeps the first two local-part characters and the full domain', () => {
    expect(maskEmail('jane@example.com')).toBe('ja***@example.com')
  })

  it('uses a fixed-length mask regardless of local-part length', () => {
    expect(maskEmail('a@example.com')).toBe('a***@example.com')
    expect(maskEmail('averylongusername@example.com')).toBe('av***@example.com')
  })

  it.each([null, undefined, ''])(
    'returns an empty string for %s rather than throwing',
    (value) => {
      expect(maskEmail(value)).toBe('')
    },
  )

  it('returns the input unchanged if there is no @ to mask', () => {
    expect(maskEmail('not-an-email')).toBe('not-an-email')
  })
})
