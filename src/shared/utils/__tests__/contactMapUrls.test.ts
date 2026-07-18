import { describe, it, expect } from 'vitest'
import { isValidHttpsUrl, isApprovedMapEmbedUrl } from '../contactMapUrls'

describe('isValidHttpsUrl', () => {
  it('accepts a valid HTTPS URL', () => {
    expect(isValidHttpsUrl('https://example.com/path')).toBe(true)
  })

  it('accepts HTTPS with query params and fragment', () => {
    expect(isValidHttpsUrl('https://www.google.com/maps?q=test#section')).toBe(true)
  })

  it('rejects HTTP URLs', () => {
    expect(isValidHttpsUrl('http://example.com/path')).toBe(false)
  })

  it('rejects javascript: URIs', () => {
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: URIs', () => {
    expect(isValidHttpsUrl('data:text/html,<h1>hi</h1>')).toBe(false)
  })

  it('rejects user-info lookalike URLs', () => {
    expect(isValidHttpsUrl('https://www.google.com@evil.com/maps/embed')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidHttpsUrl('')).toBe(false)
  })

  it('rejects malformed strings', () => {
    expect(isValidHttpsUrl('not a url at all')).toBe(false)
  })

  it('rejects URLs with username and password', () => {
    expect(isValidHttpsUrl('https://user:pass@evil.com/path')).toBe(false)
  })
})

describe('isApprovedMapEmbedUrl', () => {
  describe('accepted URLs', () => {
    it('accepts Google Maps embed URL', () => {
      expect(isApprovedMapEmbedUrl('https://www.google.com/maps/embed?pb=!1m18')).toBe(true)
    })

    it('accepts Google Maps embed URL with sub-path', () => {
      expect(isApprovedMapEmbedUrl('https://www.google.com/maps/embed/v1/place?key=x')).toBe(true)
    })

    it('accepts OpenStreetMap embed URL', () => {
      expect(
        isApprovedMapEmbedUrl('https://www.openstreetmap.org/export/embed.html?bbox=1,2,3,4'),
      ).toBe(true)
    })

    it('accepts OpenStreetMap embed URL with fragment', () => {
      expect(
        isApprovedMapEmbedUrl('https://www.openstreetmap.org/export/embed.html#map=12/0/0'),
      ).toBe(true)
    })
  })

  describe('rejected URLs', () => {
    it('rejects HTTP Google Maps embed (not HTTPS)', () => {
      expect(isApprovedMapEmbedUrl('http://www.google.com/maps/embed?pb=!1m18')).toBe(false)
    })

    it('rejects non-approved origins', () => {
      expect(isApprovedMapEmbedUrl('https://maps.google.com/maps/embed?pb=!1m18')).toBe(false)
    })

    it('rejects Google Maps without embed pathname', () => {
      expect(isApprovedMapEmbedUrl('https://www.google.com/maps/place/Something')).toBe(false)
    })

    it('rejects OpenStreetMap without the embed pathname', () => {
      expect(isApprovedMapEmbedUrl('https://www.openstreetmap.org/export/other.html')).toBe(false)
    })

    it('rejects user-info lookalike targeting Google Maps', () => {
      expect(isApprovedMapEmbedUrl('https://www.google.com@evil.com/maps/embed?pb=x')).toBe(false)
    })

    it('rejects user-info lookalike targeting OpenStreetMap', () => {
      expect(
        isApprovedMapEmbedUrl(
          'https://www.openstreetmap.org@evil.com/export/embed.html?bbox=1,2,3,4',
        ),
      ).toBe(false)
    })

    it('rejects javascript: URIs', () => {
      expect(isApprovedMapEmbedUrl('javascript:alert(1)')).toBe(false)
    })

    it('rejects empty string', () => {
      expect(isApprovedMapEmbedUrl('')).toBe(false)
    })

    it('rejects malformed strings', () => {
      expect(isApprovedMapEmbedUrl('not-a-url')).toBe(false)
    })

    it('rejects a random HTTPS URL', () => {
      expect(isApprovedMapEmbedUrl('https://evil.com/maps/embed')).toBe(false)
    })

    it('rejects subdomain variations of approved origins', () => {
      expect(isApprovedMapEmbedUrl('https://evil.www.google.com/maps/embed?pb=x')).toBe(false)
    })

    it('rejects google.com without www', () => {
      expect(isApprovedMapEmbedUrl('https://google.com/maps/embed?pb=x')).toBe(false)
    })
  })
})
