import { cn } from '@/shared/utils/cn'
import type { TestimonialsSectionConfig } from '@/shared/types/StorefrontConfig'
import { useTestimonials } from '@/storefront/hooks/useTestimonials'

export function TestimonialsSection({ section }: { section: TestimonialsSectionConfig }) {
  const { layout = 'grid', columns = 3, heading = 'Testimonials' } = section.props

  const { data: testimonials, isLoading, isError } = useTestimonials()

  const columnClasses: Record<1 | 2 | 3, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }

  const isStacked = layout === 'stacked'

  if (isLoading) {
    return (
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-48 rounded bg-(--sf-panel) animate-pulse" />
          <div
            className={cn(
              'mt-10 grid gap-8',
              isStacked ? 'grid-cols-1' : columnClasses[columns],
            )}
          >
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="h-20 rounded bg-(--sf-panel) animate-pulse" />
                <div className="h-4 w-32 rounded bg-(--sf-panel) animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (isError || !testimonials || testimonials.length === 0) {
    return null
  }

  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-(--sf-text)">{heading}</h2>
        <div
          className={cn(
            'mt-10 grid gap-8',
            isStacked ? 'grid-cols-1' : columnClasses[columns],
          )}
        >
          {testimonials.map((item) => (
            <div key={item.id} className="flex flex-col gap-4">
              <blockquote className="text-(--sf-text) italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="text-sm font-medium text-(--sf-text)">
                {item.authorName}
                {item.authorTitle && `, ${item.authorTitle}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
