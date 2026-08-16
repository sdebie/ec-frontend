import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/admin/hooks/testimonials', async () => {
  const actual = await vi.importActual<typeof import('@/admin/hooks/testimonials')>(
    '@/admin/hooks/testimonials',
  )
  return {
    useAdminTestimonials: vi.fn(),
    useCreateTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useUpdateTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useDeleteTestimonial: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    testimonialFormSchema: actual.testimonialFormSchema,
  }
})


import { useAdminTestimonials } from '@/admin/hooks/testimonials'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { TestimonialsPage } from '../TestimonialsPage'

useAdminAuthStore.setState({ role: 'SUPER_ADMIN' })

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

const testimonialArb = fc.record({
  id: fc.uuid(),
  quote: fc.string({ minLength: 1, maxLength: 200 }),
  authorName: fc.string({ minLength: 1, maxLength: 50 }),
  authorTitle: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  published: fc.boolean(),
  sortOrder: fc.nat({ max: 100 }),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
})

describe('Feature: testimonials-management, Property 4: Admin table row renders all required fields', () => {
  it('for any valid AdminTestimonial, the table renders truncated quote, author name, published indicator, and sort order', () => {
    fc.assert(
      fc.property(testimonialArb, (testimonial) => {
        vi.mocked(useAdminTestimonials).mockReturnValue({
          data: [testimonial],
          isLoading: false,
          error: null,
        } as any)

        const { container, unmount } = render(
          <QueryClientProvider client={createQueryClient()}>
            <TestimonialsPage />
          </QueryClientProvider>,
        )

        // Use textContent to avoid HTML entity encoding issues (e.g. & → &amp;)
        const text = container.textContent ?? ''

        // Quote (truncated if > 80)
        const expectedQuote =
          testimonial.quote.length > 80
            ? testimonial.quote.slice(0, 80) + '...'
            : testimonial.quote
        expect(text).toContain(expectedQuote)

        // Author name
        expect(text).toContain(testimonial.authorName)

        // Published indicator
        const publishedLabel = testimonial.published ? 'Published' : 'Draft'
        expect(text).toContain(publishedLabel)

        // Sort order
        expect(text).toContain(String(testimonial.sortOrder))

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
