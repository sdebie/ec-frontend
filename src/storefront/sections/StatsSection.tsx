import type {StatsSectionConfig} from '@/shared/types/StorefrontConfig'
import {Section} from './shared/Section'
import {SectionHeading} from './shared/SectionHeading'

export function StatsSection({section}: { section: StatsSectionConfig }) {
    const {title, eyebrow, variant, items} = section.props

    if (!items || items.length === 0) return null

    return (
        <Section variant={variant} width="default">
            {title && <SectionHeading title={title} eyebrow={eyebrow}/>}
            <div
                className="grid grid-cols-1 divide-y divide-(--sf-border) in-data-[variant=dark]:divide-white/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3"
            >
                {items.map((item) => (
                    <div key={item.label} className="px-6 py-6 text-center first:pt-0 sm:py-0">
                        <p className="text-3xl font-bold text-(--sf-accent) in-data-[variant=dark]:text-inherit">{item.value}</p>
                        <p className="mt-1 text-sm text-(--sf-muted-text) in-data-[variant=dark]:text-white/70">{item.label}</p>
                    </div>
                ))}
            </div>
        </Section>
    )
}
