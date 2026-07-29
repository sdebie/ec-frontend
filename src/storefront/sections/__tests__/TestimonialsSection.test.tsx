import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as fc from 'fast-check'

vi.mock('@/storefront/hooks/useTestimonials')

import { useTestimonials } from '@/storefront/hooks/useTestimonials'
import { TestimonialsSection } from '../TestimonialsSection'
import type { TestimonialsSectionConfig } from '@/shared/types/StorefrontConfig'

const mockedUseTestimonials = vi.mocked(useTestimonials)

// ResizeObserver is not available in jsdom — mock it globally
let originalResizeObserver: typeof ResizeObserver
beforeEach(() => {
  originalResizeObserver = globalThis.ResizeObserver
  globalThis.ResizeObserver = class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})
afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver
})

const mockTestimonials = [
  { id: '1', quote: 'Great service!', authorName: 'John Doe', authorTitle: 'CEO' },
  { id: '2', quote: 'Fast delivery.', authorName: 'Jane Smith', authorTitle: null },
  { id: '3', quote: 'Excellent products.', authorName: 'Bob Jones', authorTitle: 'Manager' },
]

function makeSection(
  props: Partial<TestimonialsSectionConfig['props']> = {},
): TestimonialsSectionConfig {
  return {
    id: 'testimonials-1',
    type: 'testimonials',
    props: { title: 'Customer Reviews', layout: 'grid', columns: 3, ...props },
  }
}

describe('TestimonialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Validates: Requirements 6.2, 6.3, 6.4
   *
   * Property: all layout × variant combinations render without throwing,
   * and dark classes only appear under variant="dark".
   */
  it('renders without error for all layout × variant combinations (fast-check)', () => {
    mockedUseTestimonials.mockReturnValue({
      data: mockTestimonials,
      isLoading: false,
      isError: false,
    } as any)

    fc.assert(
      fc.property(
        fc.constantFrom('grid', 'stacked', 'carousel'),
        fc.constantFrom('light', 'dark', undefined),
        (layout, variant) => {
          const section = makeSection({
            layout: layout as 'grid' | 'stacked' | 'carousel',
            variant: variant as 'light' | 'dark' | undefined,
          })
          const { container, unmount } = render(
            <TestimonialsSection section={section} />,
          )

          // Should not throw — rendered something
          expect(container.innerHTML).not.toBe('')

          // Dark variant assertion: data-variant="dark" only present when variant is "dark"
          const sectionEl = container.querySelector('section')
          if (variant === 'dark') {
            expect(sectionEl?.getAttribute('data-variant')).toBe('dark')
          } else {
            expect(sectionEl?.getAttribute('data-variant')).toBeNull()
          }

          unmount()
        },
      ),
      { numRuns: 30 },
    )
  })

  describe('carousel layout', () => {
    beforeEach(() => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)
    })

    it('renders a role="region" element with aria-label "Testimonials"', () => {
      const section = makeSection({ layout: 'carousel' })
      render(<TestimonialsSection section={section} />)

      const region = screen.getByRole('region', { name: 'Testimonials' })
      expect(region).toBeInTheDocument()
    })

    it('renders cards inside snap-aligned cells', () => {
      const section = makeSection({ layout: 'carousel' })
      const { container } = render(<TestimonialsSection section={section} />)

      const snapCells = container.querySelectorAll('.snap-start')
      expect(snapCells.length).toBe(mockTestimonials.length)
    })
  })

  describe('grid and stacked layouts', () => {
    beforeEach(() => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)
    })

    it('grid renders items in a grid with column classes', () => {
      const section = makeSection({ layout: 'grid', columns: 3 })
      const { container } = render(<TestimonialsSection section={section} />)

      const grid = container.querySelector('.grid-cols-3')
      expect(grid).toBeInTheDocument()
    })

    it('stacked renders in grid-cols-1', () => {
      const section = makeSection({ layout: 'stacked' })
      const { container } = render(<TestimonialsSection section={section} />)

      const grid = container.querySelector('.grid-cols-1')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('card content', () => {
    beforeEach(() => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)
    })

    it('renders quote text in blockquote elements', () => {
      const section = makeSection()
      const { container } = render(<TestimonialsSection section={section} />)

      const blockquotes = container.querySelectorAll('blockquote')
      expect(blockquotes).toHaveLength(mockTestimonials.length)
      expect(blockquotes[0].textContent).toContain('Great service!')
    })

    it('renders author name', () => {
      const section = makeSection()
      render(<TestimonialsSection section={section} />)

      expect(screen.getByText(/John Doe/)).toBeInTheDocument()
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
      expect(screen.getByText(/Bob Jones/)).toBeInTheDocument()
    })

    it('renders author title when present', () => {
      const section = makeSection()
      render(<TestimonialsSection section={section} />)

      expect(screen.getByText(/CEO/)).toBeInTheDocument()
      expect(screen.getByText(/Manager/)).toBeInTheDocument()
    })

    it('does not render authorTitle separator when authorTitle is null', () => {
      mockedUseTestimonials.mockReturnValue({
        data: [{ id: '2', quote: 'Fast delivery.', authorName: 'Jane Smith', authorTitle: null }],
        isLoading: false,
        isError: false,
      } as any)

      const section = makeSection()
      render(<TestimonialsSection section={section} />)

      const authorEl = screen.getByText('Jane Smith')
      expect(authorEl.textContent).not.toContain(',')
    })
  })

  describe('no stars', () => {
    it('does not render any star glyph or star-related icon in any layout/variant combination', () => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)

      const layouts = ['grid', 'stacked', 'carousel'] as const
      const variants = ['light', 'dark', undefined] as const

      for (const layout of layouts) {
        for (const variant of variants) {
          const section = makeSection({ layout, variant })
          const { container, unmount } = render(
            <TestimonialsSection section={section} />,
          )

          const html = container.innerHTML
          // No star glyphs
          expect(html).not.toContain('★')
          expect(html).not.toContain('☆')
          expect(html).not.toContain('⭐')
          // No star SVG/icon references (word boundary to avoid false positives like "snap-start")
          expect(html).not.toMatch(/\bstar\b/i)

          unmount()
        }
      }
    })
  })

  describe('null on empty/error', () => {
    it('returns null when testimonials array is empty', () => {
      mockedUseTestimonials.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any)

      const { container } = render(
        <TestimonialsSection section={makeSection()} />,
      )
      expect(container.innerHTML).toBe('')
    })

    it('returns null when hook errors', () => {
      mockedUseTestimonials.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      } as any)

      const { container } = render(
        <TestimonialsSection section={makeSection()} />,
      )
      expect(container.innerHTML).toBe('')
    })

    it('returns null when data is undefined', () => {
      mockedUseTestimonials.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
      } as any)

      const { container } = render(
        <TestimonialsSection section={makeSection()} />,
      )
      expect(container.innerHTML).toBe('')
    })
  })

  describe('loading skeleton', () => {
    it('shows skeleton with animate-pulse when isLoading', () => {
      mockedUseTestimonials.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as any)

      const { container } = render(
        <TestimonialsSection section={makeSection()} />,
      )
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders skeleton inside a Section with the correct variant', () => {
      mockedUseTestimonials.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as any)

      const { container } = render(
        <TestimonialsSection section={makeSection({ variant: 'dark' })} />,
      )
      const sectionEl = container.querySelector('section')
      expect(sectionEl?.getAttribute('data-variant')).toBe('dark')
    })
  })

  describe('title default', () => {
    it('uses "Testimonials" as fallback title when title prop is absent', () => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)

      const section: TestimonialsSectionConfig = {
        id: 'testimonials-1',
        type: 'testimonials',
        props: {},
      }

      render(<TestimonialsSection section={section} />)
      expect(screen.getByText('Testimonials')).toBeInTheDocument()
    })
  })
})
