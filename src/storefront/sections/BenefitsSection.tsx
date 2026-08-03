import {Link} from 'react-router-dom'

import type {BenefitsSectionConfig} from '@/shared/types/StorefrontConfig'
import {cn} from '@/shared/utils/cn'

import {Section, SectionHeading} from './shared'
import {resolveSectionIcon} from './shared/sectionIcons'

const explicitColsClass: Record<2 | 3 | 4, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * Item count is seed-driven and varies per client; the desktop column count
 * must divide evenly where possible so no card is orphaned on its own row
 * (4 items in a 3-column grid leaves a stranded card). An explicit `columns`
 * seed prop overrides the derivation.
 */
function gridColsClass(count: number, columns?: 2 | 3 | 4): string {
    if (columns) return explicitColsClass[columns]
    if (count <= 2) return 'sm:grid-cols-2'
    if (count % 4 === 0) return 'sm:grid-cols-2 lg:grid-cols-4'
    return 'sm:grid-cols-2 lg:grid-cols-3'
}

// Desktop column class for the divided 'strip' layout (its base/sm classes are
// fixed by the divider pattern, so only the lg count varies).
function stripLgColsClass(count: number, columns?: 2 | 3 | 4): string {
    const cols = columns ?? (count % 4 === 0 ? 4 : count <= 2 ? 2 : 3)
    return {2: '', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4'}[cols]
}

export function BenefitsSection({section}: { section: BenefitsSectionConfig }) {
    const {
        title,
        subtitle,
        eyebrow,
        variant,
        layout = 'cards',
        iconPlacement = 'top',
        columns,
        items,
        footnote,
    } = section.props

    return (
        <Section variant={variant}>
            {title && <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow}/>}

            {layout === 'strip' ? (
                // The StatsSection band treatment: borderless divided blocks, centered.
                <div
                    className={cn(
                        'grid grid-cols-1 divide-y divide-(--sf-border) in-data-[variant=dark]:divide-white/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0',
                        stripLgColsClass(items.length, columns),
                        title && 'mt-6',
                    )}
                >
                    {items.map((item) => {
                        const IconComponent = resolveSectionIcon(item.icon, 'BenefitsSection')

                        return (
                            <div key={item.title} className="px-6 py-5 text-center max-sm:first:pt-0 sm:py-1">
                                <div className="flex items-center justify-center gap-2">
                                    {IconComponent && (
                                        <IconComponent
                                            className="h-5 w-5 shrink-0 text-(--sf-accent) in-data-[variant=dark]:text-white/90"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <h3 className="font-semibold text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.title}</h3>
                                </div>
                                <p className="mt-1 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">{item.description}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className={cn('grid gap-4', gridColsClass(items.length, columns), title && 'mt-6')}>
                    {items.map((item) => {
                        const IconComponent = resolveSectionIcon(item.icon, 'BenefitsSection')

                        return (
                            <article
                                key={item.title}
                                className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 shadow-(--sf-shadow-sm) in-data-[variant=dark]:border-white/10 in-data-[variant=dark]:bg-white/5"
                            >
                                {iconPlacement === 'inline' ? (
                                    // Same icon badge the promo-grid tiles use, so a tile reads the
                                    // same wherever it appears on the storefront.
                                    <div className="flex items-center gap-3">
                                        {IconComponent && (
                                            <span
                                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--sf-accent)_10%,transparent)]"
                                                aria-hidden="true"
                                            >
                                              <IconComponent className="h-5 w-5 text-(--sf-accent)"/>
                                            </span>
                                        )}
                                        <h3 className="font-medium text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.title}</h3>
                                    </div>
                                ) : (
                                    <>
                                        {IconComponent && (
                                            <IconComponent
                                                className="mb-2 h-5 w-5 text-(--sf-accent)"
                                                aria-hidden="true"
                                            />
                                        )}
                                        <h3 className="font-medium text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.title}</h3>
                                    </>
                                )}
                                <p className="mt-2 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">{item.description}</p>
                            </article>
                        )
                    })}
                </div>
            )}

            {footnote && footnote.length > 0 && (
                <p className="mt-6 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">
                    {footnote.map((segment, index) =>
                        segment.to ? (
                            <Link
                                key={index}
                                to={segment.to}
                                className="font-medium text-(--sf-accent) hover:underline in-data-[variant=dark]:text-white in-data-[variant=dark]:underline"
                            >
                                {segment.text}
                            </Link>
                        ) : (
                            <span key={index}>
                              {segment.text}
                            </span>
                        )
                    )}
                </p>
            )}
        </Section>
    )
}
