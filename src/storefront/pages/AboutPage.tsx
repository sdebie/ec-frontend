import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {SectionList} from '@/storefront/sections/SectionList'

export function AboutPage() {
    const config = useStorefrontConfig()

    return (
        <main>
            <SectionList sections={config.aboutSections} />
        </main>
    )
}
