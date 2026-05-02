import {Suspense} from 'react'
import {resolveStorefrontPageCore} from '@/storefront/registry/resolveStorefrontPageCore'
import {useStorefrontCategory} from '@/app/providers/StorefrontCategoryProvider'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import {StorefrontRouteSuspenseFallback} from '@/storefront/routes/storefrontRouteSuspenseFallback'
import type {RouteObject} from '@/types/routes.ts'
import type {
    StorefrontPageComponent,
    StorefrontPageKey,
} from '@/types/storefront/storefrontPageContracts'

interface StorefrontRoutesProps {
    route: RouteObject
}

/**
 * Storefront route renderer — reads config from StorefrontProvider via strict hook.
 */
export function StorefrontRoutes({route}: StorefrontRoutesProps) {
    const {activeCategory} = useStorefrontCategory()
    const {config: effectiveStorefrontConfig} = useStorefrontBoundary()

    const {component: StorefrontComponent} = resolveStorefrontPageCore({
        routeKey: route.key as StorefrontPageKey,
        routeComponent: route.component as StorefrontPageComponent,
        storefrontConfig: effectiveStorefrontConfig,
    })
    const meta = route.meta || {}

    return (
        <Suspense fallback={<StorefrontRouteSuspenseFallback />}>
            <StorefrontComponent
                activeCategory={activeCategory}
                storefrontConfig={effectiveStorefrontConfig}
                {...meta}
            />
        </Suspense>
    )
}
