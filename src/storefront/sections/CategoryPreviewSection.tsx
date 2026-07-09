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
                <p className="mt-2 text-gray-600">{subtitle}</p>
            )}

            {layout === 'list' ? (
                <div className="mt-6 flex flex-col divide-y divide-gray-200">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            to={item.to}
                            className="flex items-start gap-4 py-4 transition hover:bg-gray-50"
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
                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
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
                            className="group overflow-hidden rounded-lg border border-gray-200 transition hover:border-gray-400"
                        >
                            {item.imageSrc && (
                                <div
                                    className="aspect-[4/3] w-full overflow-hidden border-b border-gray-200 bg-gray-100">
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
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
