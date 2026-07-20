import type {StatsSectionConfig} from '@/shared/types/StorefrontConfig'

export function StatsSection({section}: { section: StatsSectionConfig }) {
    const {title, items} = section.props

    if (!items || items.length === 0) return null

    return (
        <section className="py-12 px-6 sm:px-8 bg-(--sf-surface-muted)">
            {title && (
                <h2 className="mb-8 text-center text-2xl font-semibold text-(--sf-text)">{title}</h2>
            )}
            <div
                className="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-(--sf-border) sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3"
            >
                {items.map((item) => (
                    <div key={item.label} className="px-6 py-6 text-center first:pt-0 sm:py-0">
                        <p className="text-3xl font-bold text-(--sf-accent)">{item.value}</p>
                        <p className="mt-1 text-sm text-(--sf-muted-text)">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
