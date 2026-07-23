import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock the hook at its real import path
vi.mock('@/storefront/hooks/useTestimonials', () => ({
  useTestimonials: vi.fn(),
}))

import { useTestimonials } from '@/storefront/hooks/useTestimonials'
import { TestimonialsSection } from '../TestimonialsSection'
import type { TestimonialsSectionConfig } from '@/shared/types/StorefrontConfig'

const mockedUseTestimonials = vi.mocked(useTestimonials)

const defaultSection: TestimonialsSectionConfig = {
  id: 'testimonials-1',
  type: 'testimonials',
  props: {
    heading: 'Customer Reviews',
    layout: 'grid',
    columns: 3,
  },
}

const mockTestimonials = [
  { id: '1', quote: 'Excellent service and products', authorName: 'John Smith', authorTitle: 'CEO, Test Corp' },
  { id: '2', quote: 'Would recommend to anyone', authorName: 'Jane Doe', authorTitle: null },
]

function renderSection(section: TestimonialsSectionConfig = defaultSection) {
  return render(<TestimonialsSection section={section} />)
}

describe('TestimonialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders skeleton pulse placeholders while loading', () => {
    mockedUseTestimonials.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any)

    const { container } = renderSection()
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('returns null when data is empty', () => {
    mockedUseTestimonials.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any)

    const { container } = renderSection()
    expect(container.innerHTML).toBe('')
  })

  it('returns null on error', () => {
    mockedUseTestimonials.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any)

    const { container } = renderSection()
    expect(container.innerHTML).toBe('')
  })

  it('renders testimonials from API data with heading', () => {
    mockedUseTestimonials.mockReturnValue({
      data: mockTestimonials,
      isLoading: false,
      isError: false,
    } as any)

    renderSection()

    expect(screen.getByText('Customer Reviews')).toBeInTheDocument()
    expect(screen.getByText(/Excellent service and products/)).toBeInTheDocument()
    expect(screen.getByText(/Would recommend to anyone/)).toBeInTheDocument()
    expect(screen.getByText(/John Smith/)).toBeInTheDocument()
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()
    expect(screen.getByText(/CEO, Test Corp/)).toBeInTheDocument()
  })

  it('uses default heading "Testimonials" when heading prop is absent', () => {
    mockedUseTestimonials.mockReturnValue({
      data: mockTestimonials,
      isLoading: false,
      isError: false,
    } as any)

    const sectionNoHeading: TestimonialsSectionConfig = {
      id: 'testimonials-1',
      type: 'testimonials',
      props: {},
    }

    renderSection(sectionNoHeading)

    expect(screen.getByText('Testimonials')).toBeInTheDocument()
  })

  it('renders in stacked layout when layout prop is stacked', () => {
    mockedUseTestimonials.mockReturnValue({
      data: mockTestimonials,
      isLoading: false,
      isError: false,
    } as any)

    const stackedSection: TestimonialsSectionConfig = {
      id: 'testimonials-1',
      type: 'testimonials',
      props: { layout: 'stacked' },
    }

    const { container } = renderSection(stackedSection)
    const grid = container.querySelector('.grid-cols-1')
    expect(grid).toBeInTheDocument()
  })

  it('does not render authorTitle when it is null', () => {
    mockedUseTestimonials.mockReturnValue({
      data: [{ id: '1', quote: 'Great', authorName: 'Bob', authorTitle: null }],
      isLoading: false,
      isError: false,
    } as any)

    renderSection()

    expect(screen.getByText(/Bob/)).toBeInTheDocument()
    // Should only show "Bob" without a comma separator
    const authorEl = screen.getByText('Bob')
    expect(authorEl.textContent).not.toContain(',')
  })
})
