import type {SectionConfig} from '@/shared/types/StorefrontConfig'
import {SectionErrorBoundary} from '@/storefront/sections/SectionErrorBoundary'
import {sectionRegistry} from '@/storefront/sections/sectionRegistry'

interface SectionListProps {
  sections: SectionConfig[] | undefined
}

export function SectionList({ sections }: SectionListProps) {
    return (
        <>
            {(sections ?? []).map((section) => {
                const SectionComponent = sectionRegistry[section.type]
                if (!SectionComponent) {
                    if (import.meta.env.DEV) {
                        console.warn(`[sectionRegistry] Unknown section type: "${section.type}" (id: ${section.id})`)
                    }
                    return null
                }
                return (
                    <SectionErrorBoundary key={section.id}>
                        <SectionComponent section={section}/>
                    </SectionErrorBoundary>
                )
            })}
        </>
    )
}
