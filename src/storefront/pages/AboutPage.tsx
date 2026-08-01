import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {SectionList} from '@/storefront/sections/SectionList'

export function AboutPage() {
    const config = useStorefrontConfig()

    return (
        <div>
            <SectionList sections={config.aboutSections} />
        </div>
    )
}
