import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import type { PromoGridSectionConfig } from '@/shared/types/StorefrontConfig'
import { Section, SectionHeading } from './shared'

// Single-column base so tiles stack on phones; `columns` sets the desktop count.
// Used by the 'feature-first' layout, which needs a real grid for its col-span.
const gridColsClass: Record<2 | 3 | 4 | 5, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
}

// The 'cards' layout wraps with flex so an incomplete last row centers itself
// (e.g. 5 tiles at 3 columns → 3 + 2 centered). Basis values are exact column
// fractions minus the gap-4 share so full rows match the grid exactly.
const cardBasisClass: Record<2 | 3 | 4 | 5, string> = {
  2: 'sm:basis-[calc((100%-1rem)/2)]',
  3: 'sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]',
  4: 'sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-3rem)/4)]',
  5: 'sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-4rem)/5)]',
}

export function PromoGridSection({ section }: { section: PromoGridSectionConfig }) {
  const {
    title,
    subtitle,
    eyebrow,
    icon,
    layout = 'cards',
    compact = false,
    columns = 3,
    items,
  } = section.props

  // Missing/unuploaded images collapse the tile to its text-first form
  // (spec: tiles render text-first) instead of showing a broken image.
  const [failedImageIds, setFailedImageIds] = useState<ReadonlySet<string>>(new Set())

  return (
    <Section className={compact ? 'py-8' : undefined}>
      <SectionHeading
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        icon={icon}
        className={compact ? 'mb-4' : undefined}
      />

      <div
        className={cn(
          'gap-4',
          layout === 'feature-first'
            ? cn('grid', gridColsClass[columns])
            : 'flex flex-wrap justify-center',
        )}
      >
        {items.map((item, index) => {
          const resolvedImage =
            item.imageUrl && !failedImageIds.has(item.id) ? resolveImageUrl(item.imageUrl) : null

          return (
            <article
              key={item.id}
              className={cn(
                'overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel) shadow-sm',
                layout === 'feature-first' && index === 0 && 'lg:col-span-2',
                layout === 'cards' && cn('w-full grow-0', cardBasisClass[columns]),
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
