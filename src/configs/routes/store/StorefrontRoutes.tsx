import {Suspense} from 'react'

import {useStorefrontCategory} from '@/app/providers/StorefrontCategoryProvider'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import {RouteErrorBoundary} from '@/components/shared/error-boundary/RouteErrorBoundary'
import {StorefrontRouteSuspenseFallback} from '@/configs/routes/store/storefrontRouteSuspenseFallback'
import {resolveStorefrontPageCore} from '@/configs/storefront/resolveStorefrontPageCore'

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
        <RouteErrorBoundary>
            <Suspense fallback={<StorefrontRouteSuspenseFallback />}>
                <StorefrontComponent
                    activeCategory={activeCategory}
                    storefrontConfig={effectiveStorefrontConfig}
                    {...meta}
                />
            </Suspense>
        </RouteErrorBoundary>
    )
}
