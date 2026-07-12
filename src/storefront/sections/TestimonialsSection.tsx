import { cn } from '@/shared/utils/cn'
import type { TestimonialsSectionConfig } from '@/shared/types/StorefrontConfig'

export function TestimonialsSection({ section }: { section: TestimonialsSectionConfig }) {
  const {
    title,
    subtitle,
    layout = 'grid',
    columns = 3,
    items,
  } = section.props

  const columnClasses: Record<1 | 2 | 3, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }

  const isStacked = layout === 'stacked'

  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-(--sf-text)">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-lg text-(--sf-muted-text)">{subtitle}</p>
        )}
        <div
          className={cn(
            'mt-10 grid gap-8',
            isStacked ? 'grid-cols-1' : columnClasses[columns],
          )}
        >
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4">
              <blockquote className="text-(--sf-text) italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <p className="text-sm font-medium text-(--sf-text)">
                {item.name}
                {item.role && `, ${item.role}`}
                {item.company && ` at ${item.company}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
