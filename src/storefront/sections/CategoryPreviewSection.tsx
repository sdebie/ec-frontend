import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import type {CategoryPreviewSectionConfig} from '@/shared/types/StorefrontConfig'
import {Section, SectionHeading} from './shared'

// Single-column base so tiles stack on phones; `columns` sets the desktop count.
const gridColsClass: Record<2 | 3 | 4 | 6, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

export function CategoryPreviewSection({section}: { section: CategoryPreviewSectionConfig }) {
    const {
        title,
        subtitle,
        eyebrow,
        variant,
        layout = 'tiles',
        imagePosition = 'top',
        columns = 3,
        items,
    } = section.props

    const sideImage = imagePosition === 'left'

    return (
        <Section variant={variant}>
            <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow} />

            {layout === 'list' ? (
                <div className="mt-6 flex flex-col divide-y divide-(--sf-border)">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            to={item.to}
                            className="flex items-start gap-4 py-4 transition hover:bg-(--sf-surface-muted)"
                        >
                            {item.imageSrc && (
                                <img
                                    src={resolveImageUrl(item.imageSrc) ?? undefined}
                                    alt={item.imageAlt ?? item.label}
                                    loading="lazy"
                                    className="h-16 w-16 rounded object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium text-(--sf-text)">{item.label}</p>
                                {item.description && (
                                    <p className="mt-1 text-sm text-(--sf-muted-text)">{item.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className={cn('mt-6 grid gap-4', gridColsClass[columns])}>
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            to={item.to}
                            className={cn(
                                'group flex h-full overflow-hidden rounded-lg border border-(--sf-border) transition hover:border-(--sf-muted-text) in-data-[variant=dark]:border-white/10 in-data-[variant=dark]:bg-white/5 in-data-[variant=dark]:hover:border-white/30',
                                sideImage ? 'flex-row' : 'flex-col',
                            )}
                        >
                            {item.imageSrc && (
                                <div
                                    className={cn(
                                        'overflow-hidden bg-(--sf-surface-muted) in-data-[variant=dark]:border-white/10 in-data-[variant=dark]:bg-white/5',
                                        sideImage
                                            ? 'w-24 shrink-0 border-r border-(--sf-border)'
                                            : 'aspect-[4/3] w-full border-b border-(--sf-border)',
                                    )}>
                                    <img
                                        src={resolveImageUrl(item.imageSrc) ?? undefined}
                                        alt={item.imageAlt ?? item.label}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 p-4">
                                <h3 className="font-medium text-(--sf-text) in-data-[variant=dark]:text-inherit">{item.label}</h3>
                                {item.description && (
                                    <p className="mt-1 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">{item.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </Section>
    )
}
