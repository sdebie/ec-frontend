import {resolveStorefrontPageCore} from '@/storefront/registry/resolveStorefrontPageCore'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import type {RouteObject} from '@/types/routes.ts'
import type {
    StorefrontPageComponent,
    StorefrontPageKey,
} from '@/types/storefront/storefrontPageContracts'

interface StorefrontRoutesProps {
    route: RouteObject
    activeCategory: string
    setActiveCategory: (value: string) => void
}

/**
 * Storefront route renderer — reads config from StorefrontProvider via strict hook.
 */
export function StorefrontRoutes({
    route,
    activeCategory,
    setActiveCategory: _setActiveCategory,
}: StorefrontRoutesProps) {
    const {config: effectiveStorefrontConfig} = useStorefrontBoundary()

    const {component: StorefrontComponent} = resolveStorefrontPageCore({
        routeKey: route.key as StorefrontPageKey,
        routeComponent: route.component as StorefrontPageComponent,
        storefrontConfig: effectiveStorefrontConfig,
    })
    const meta = route.meta || {}

    return (
        <StorefrontComponent
            activeCategory={activeCategory}
            storefrontConfig={effectiveStorefrontConfig}
            {...meta}
        />
    )
}

