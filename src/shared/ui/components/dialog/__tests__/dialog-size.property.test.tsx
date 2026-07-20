import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { Dialog } from '../Dialog'

/**
 * Property 6: Dialog size constrains panel width
 *
 * For any valid Dialog size (sm | md | lg | xl | full), the dialog panel element
 * SHALL have the corresponding width constraint class applied.
 *
 * **Validates: Requirements 4.6**
 */

const dialogSizes = ['sm', 'md', 'lg', 'xl', 'full'] as const

type DialogSize = (typeof dialogSizes)[number]

// Expected width constraint class for each size
const sizeWidthClasses: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-10rem)]',
}

// Arbitrary for valid dialog sizes
const sizeArb = fc.constantFrom(...dialogSizes)

describe('Dialog size constrains panel width — Property Tests', () => {
  afterEach(() => {
    cleanup()
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  it('dialog panel element has the corresponding width constraint class for any valid size', () => {
    fc.assert(
      fc.property(sizeArb, (size) => {
        const { unmount } = render(
          <Dialog open={true} onClose={() => {}} size={size}>
            <div>Content</div>
          </Dialog>,
        )

        const dialogPanel = screen.getByRole('dialog')
        const className = dialogPanel.className

        expect(className).toContain(sizeWidthClasses[size])

        unmount()
        document.documentElement.style.overflow = ''
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }),
      { numRuns: 100 },
    )
  })
})
