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

    it('renders a role="region" element with aria-label matching the title', () => {
      const section = makeSection({ layout: 'carousel' })
      render(<TestimonialsSection section={section} />)

      const region = screen.getByRole('region', { name: 'Customer Reviews' })
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

  describe('carouselControls hint', () => {
    beforeEach(() => {
      mockedUseTestimonials.mockReturnValue({
        data: mockTestimonials,
        isLoading: false,
        isError: false,
      } as any)
    })

    it('default (gutter): renders own heading and no arrowPlacement prop on Carousel', () => {
      const section = makeSection({ layout: 'carousel' })
      const { container } = render(<TestimonialsSection section={section} />)

      // Own heading is rendered outside the Carousel region
      const region = screen.getByRole('region', { name: 'Customer Reviews' })
      expect(region).toBeInTheDocument()

      // The heading exists at section level (outside the carousel header row)
      const headings = container.querySelectorAll('h2')
      expect(headings.length).toBeGreaterThanOrEqual(1)
      expect(headings[0].textContent).toBe('Customer Reviews')

      // No header row inside carousel (no mb-0 heading)
      const headerRow = region.querySelector('.mb-0')
      expect(headerRow).toBeNull()

      // Gutter arrows use xl:-left-14 class (gutter is carousel default)
      const prevButton = region.querySelector('button[aria-label="Previous"]')
      if (prevButton) {
        expect(prevButton.className).toContain('xl:-left-14')
      }
    })

    it('header: passes heading into Carousel header prop, does not render own heading', () => {
      const section = makeSection({ layout: 'carousel', carouselControls: 'header' })
      const { container } = render(<TestimonialsSection section={section} />)

      const region = screen.getByRole('region', { name: 'Customer Reviews' })
      expect(region).toBeInTheDocument()

      // Header-controls mode: heading is inside the carousel header row
      const headerRow = region.querySelector('.mb-8')
      expect(headerRow).not.toBeNull()

      // Only one heading total — the one inside carousel header, not a separate one
      const allHeadings = container.querySelectorAll('h2')
      expect(allHeadings.length).toBe(1)
      expect(allHeadings[0].textContent).toBe('Customer Reviews')

      // No gutter/overlay arrows (header-controls mode uses header buttons)
      const absoluteButtons = region.querySelectorAll('button.absolute')
      expect(absoluteButtons.length).toBe(0)
    })

    it('overlay: renders own heading and passes arrowPlacement="overlay" to Carousel', () => {
      const section = makeSection({ layout: 'carousel', carouselControls: 'overlay' })
      const { container } = render(<TestimonialsSection section={section} />)

      const region = screen.getByRole('region', { name: 'Customer Reviews' })
      expect(region).toBeInTheDocument()

      // Own heading rendered outside carousel
      const headings = container.querySelectorAll('h2')
      expect(headings.length).toBeGreaterThanOrEqual(1)
      expect(headings[0].textContent).toBe('Customer Reviews')

      // No header row (not header-controls mode)
      const headerRow = region.querySelector('.mb-8')
      expect(headerRow).toBeNull()

      // Overlay arrows do NOT have xl:-left-14 (that's gutter-only)
      const prevButton = region.querySelector('button[aria-label="Previous"]')
      if (prevButton) {
        expect(prevButton.className).not.toContain('xl:-left-14')
      }
    })

    it('unknown value falls back to gutter (default) behaviour', () => {
      const section = makeSection({ layout: 'carousel', carouselControls: 'bogus' as any })
      const { container } = render(<TestimonialsSection section={section} />)

      const region = screen.getByRole('region', { name: 'Customer Reviews' })
      expect(region).toBeInTheDocument()

      // Own heading rendered (gutter behaviour)
      const headings = container.querySelectorAll('h2')
      expect(headings.length).toBeGreaterThanOrEqual(1)
      expect(headings[0].textContent).toBe('Customer Reviews')

      // No header row inside carousel
      const headerRow = region.querySelector('.mb-8')
      expect(headerRow).toBeNull()
    })

    it('non-carousel layouts ignore carouselControls and always render own heading', () => {
      const gridSection = makeSection({ layout: 'grid', carouselControls: 'header' })
      const { container } = render(<TestimonialsSection section={gridSection} />)

      // Heading is always rendered for grid layout regardless of carouselControls
      const headings = container.querySelectorAll('h2')
      expect(headings.length).toBe(1)
      expect(headings[0].textContent).toBe('Customer Reviews')

      // No carousel region
      const region = container.querySelector('[role="region"]')
      expect(region).toBeNull()
    })
  })
})
