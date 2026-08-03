import { describe, expect, it } from 'vitest'
import { waMeUrl } from '../waMeUrl'

describe('waMeUrl', () => {
  it('strips the leading + and spaces from an international number', () => {
    expect(waMeUrl('+27 82 123 4567')).toBe('https://wa.me/27821234567')
  })

  it('strips punctuation operators commonly type', () => {
    expect(waMeUrl('(011) 555-0000')).toBe('https://wa.me/0115550000')
  })

  it('passes a digits-only value through unchanged', () => {
    expect(waMeUrl('27821234567')).toBe('https://wa.me/27821234567')
  })

  it('yields a bare wa.me URL for a value with no digits (caller guards emptiness)', () => {
    expect(waMeUrl('n/a')).toBe('https://wa.me/')
  })
})
