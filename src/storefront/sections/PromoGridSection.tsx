import { Link } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import type { PromoGridSectionConfig } from '@/shared/types/StorefrontConfig'

const gridColsClass: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function PromoGridSection({ section }: { section: PromoGridSectionConfig }) {
  const {
    title,
    subtitle,
    layout = 'cards',
    columns = 3,
    items,
  } = section.props

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-(--sf-muted-text)">{subtitle}</p>
      )}

      <div className={cn('mt-6 grid gap-4', gridColsClass[columns])}>
        {items.map((item, index) => (
          <article
            key={item.id}
            className={cn(
              'rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 shadow-sm',
              layout === 'feature-first' && index === 0 && 'lg:col-span-2',
            )}
          >
            {item.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-(--sf-muted-text)">
                {item.eyebrow}
              </p>
            )}
            <h3 className="mt-1 font-medium">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-sm text-(--sf-muted-text)">{item.description}</p>
            )}
            {item.cta && (
              <Link
                to={item.cta.to}
                className="mt-3 inline-block text-sm font-medium text-(--sf-accent) hover:underline"
              >
                {item.cta.label}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
