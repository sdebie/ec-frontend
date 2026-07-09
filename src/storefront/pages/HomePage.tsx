import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {SectionErrorBoundary} from '@/storefront/sections/SectionErrorBoundary'
import {sectionRegistry} from '@/storefront/sections/sectionRegistry'

export function HomePage() {
    const config = useStorefrontConfig()

    return (
        <main>
            {config.sections.map((section) => {
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
        </main>
    )
}
