import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {SectionList} from '@/storefront/sections/SectionList'

export function HomePage() {
    const config = useStorefrontConfig()

    return (
        <div>
            <SectionList sections={config.sections} />
        </div>
    )
}
