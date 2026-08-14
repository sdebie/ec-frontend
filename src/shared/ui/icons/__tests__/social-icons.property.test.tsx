import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render } from '@testing-library/react'
import { IconFacebook } from '../IconFacebook'
import { IconInstagram } from '../IconInstagram'
import { IconLinkedIn } from '../IconLinkedIn'
import { IconTikTok } from '../IconTikTok'
import { IconWhatsApp } from '../IconWhatsApp'
import { IconXTwitter } from '../IconXTwitter'
import { IconYouTube } from '../IconYouTube'

/**
 * Property 10: Social icon prop forwarding and defaults
 *
 * Use fast-check to generate className, width, height props; assert they appear
 * on root SVG; assert defaults are 24×24 when not provided.
 *
 */

const socialIcons = [
  { name: 'IconFacebook', Component: IconFacebook },
  { name: 'IconInstagram', Component: IconInstagram },
  { name: 'IconLinkedIn', Component: IconLinkedIn },
  { name: 'IconTikTok', Component: IconTikTok },
  { name: 'IconWhatsApp', Component: IconWhatsApp },
  { name: 'IconXTwitter', Component: IconXTwitter },
  { name: 'IconYouTube', Component: IconYouTube },
] as const

// Arbitraries
const iconArb = fc.constantFrom(...socialIcons)
const classNameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
const dimensionArb = fc.integer({ min: 1, max: 512 })

describe('Social icon prop forwarding and defaults — Property Tests', () => {
  it('forwards className to the root SVG element for any social icon', () => {
    fc.assert(
      fc.property(iconArb, classNameArb, ({ Component }, className) => {
        const { container } = render(<Component className={className} />)
        const svg = container.querySelector('svg')!

        expect(svg).toBeTruthy()
        expect(svg.getAttribute('class')).toContain(className)
      }),
      { numRuns: 100 },
    )
  })

  it('forwards width and height props to the root SVG element for any social icon', () => {
    fc.assert(
      fc.property(iconArb, dimensionArb, dimensionArb, ({ Component }, width, height) => {
        const { container } = render(<Component width={width} height={height} />)
        const svg = container.querySelector('svg')!

        expect(svg).toBeTruthy()
        expect(svg.getAttribute('width')).toBe(String(width))
        expect(svg.getAttribute('height')).toBe(String(height))
      }),
      { numRuns: 100 },
    )
  })

  it('defaults to width=24 and height=24 when no dimensions provided for any social icon', () => {
    fc.assert(
      fc.property(iconArb, ({ Component }) => {
        const { container } = render(<Component />)
        const svg = container.querySelector('svg')!

        expect(svg).toBeTruthy()
        expect(svg.getAttribute('width')).toBe('24')
        expect(svg.getAttribute('height')).toBe('24')
      }),
      { numRuns: 100 },
    )
  })
})
