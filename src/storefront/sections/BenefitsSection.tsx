import type {BenefitsSectionConfig} from '@/shared/types/StorefrontConfig'

export function BenefitsSection({section}: { section: BenefitsSectionConfig }) {
    const {title, items} = section.props

    return (
        <section className="py-12 px-6 sm:px-8">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 shadow-sm"
                    >
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="mt-2 text-sm text-(--sf-muted-text)">{item.description}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}
