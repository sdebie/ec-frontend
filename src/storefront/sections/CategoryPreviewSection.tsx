import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import type {CategoryPreviewSectionConfig} from '@/shared/types/StorefrontConfig'

const gridColsClass: Record<2 | 3 | 4 | 6, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
}

export function CategoryPreviewSection({section}: { section: CategoryPreviewSectionConfig }) {
    const {
        title,
        subtitle,
        layout = 'tiles',
        columns = 3,
        items,
    } = section.props

    return (
        <section className="px-6 py-12">
            <h2 className="text-2xl font-semibold">{title}</h2>
            {subtitle && (
                <p className="mt-2 text-(--sf-muted-text)">{subtitle}</p>
            )}

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
                                    src={item.imageSrc}
                                    alt={item.imageAlt ?? item.label}
                                    loading="lazy"
                                    className="h-16 w-16 rounded object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium">{item.label}</p>
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
                            className="group overflow-hidden rounded-lg border border-(--sf-border) transition hover:border-(--sf-muted-text)"
                        >
                            {item.imageSrc && (
                                <div
                                    className="aspect-[4/3] w-full overflow-hidden border-b border-(--sf-border) bg-(--sf-surface-muted)">
                                    <img
                                        src={item.imageSrc}
                                        alt={item.imageAlt ?? item.label}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-medium">{item.label}</h3>
                                {item.description && (
                                    <p className="mt-1 text-sm text-(--sf-muted-text) line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
