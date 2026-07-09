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
        <p className="mt-2 text-gray-600">{subtitle}</p>
      )}

      <div className={cn('mt-6 grid gap-4', gridColsClass[columns])}>
        {items.map((item, index) => (
          <article
            key={item.id}
            className={cn(
              'rounded-lg border border-gray-200 bg-white p-5 shadow-sm',
              layout === 'feature-first' && index === 0 && 'lg:col-span-2',
            )}
          >
            {item.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {item.eyebrow}
              </p>
            )}
            <h3 className="mt-1 font-medium">{item.title}</h3>
            {item.description && (
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
            )}
            {item.cta && (
              <Link
                to={item.cta.to}
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
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
