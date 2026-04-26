import {StorefrontShell} from '@/storefront/layouts/StorefrontShell.tsx'
import {resolveStorefrontPageForRoute} from '@/storefront/registry/pageRegistry.ts'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import type {RouteObject} from '@/types/routes.ts'

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
    setActiveCategory,
}: StorefrontRoutesProps) {
    const {config: effectiveStorefrontConfig} = useStorefrontBoundary()

    const {component: StorefrontComponent} = resolveStorefrontPageForRoute(
        route,
        effectiveStorefrontConfig,
    )
    const meta = route.meta || {}

    return (
        <StorefrontShell
            storefrontConfig={effectiveStorefrontConfig}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
        >
            <div>
                <StorefrontComponent
                    activeCategory={activeCategory}
                    storefrontConfig={effectiveStorefrontConfig}
                    {...meta}
                />
            </div>
        </StorefrontShell>
    )
}

