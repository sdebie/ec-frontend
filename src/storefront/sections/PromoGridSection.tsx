import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import type { PromoGridSectionConfig } from '@/shared/types/StorefrontConfig'
import { Section, SectionHeading } from './shared'

const gridColsClass: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function PromoGridSection({ section }: { section: PromoGridSectionConfig }) {
  const {
    title,
    subtitle,
    eyebrow,
    layout = 'cards',
    columns = 3,
    items,
  } = section.props

  // Missing/unuploaded images collapse the tile to its text-first form
  // (spec: tiles render text-first) instead of showing a broken image.
  const [failedImageIds, setFailedImageIds] = useState<ReadonlySet<string>>(new Set())

  return (
    <Section>
      <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow} />

      <div className={cn('grid gap-4', gridColsClass[columns])}>
        {items.map((item, index) => {
          const resolvedImage =
            item.imageUrl && !failedImageIds.has(item.id) ? resolveImageUrl(item.imageUrl) : null

          return (
            <article
              key={item.id}
              className={cn(
                'overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel) shadow-sm',
                layout === 'feature-first' && index === 0 && 'lg:col-span-2',
                !resolvedImage && 'p-5',
              )}
            >
              {resolvedImage && (
                <img
                  src={resolvedImage}
                  alt={item.title}
                  className="aspect-[16/9] w-full object-cover"
                  onError={() => {
                    setFailedImageIds((prev) => new Set(prev).add(item.id))
                  }}
                />
              )}
              <div className={cn(resolvedImage && 'p-5')}>
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
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
