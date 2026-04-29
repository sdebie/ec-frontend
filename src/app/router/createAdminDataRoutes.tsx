import RouteGuard from '@/configs/routes/RouteGuard'
import {adminRoutingRoutes} from '@/configs/routes/admin/adminPageRoutes.config'
import {flattenRoutes} from '@/app/router/flattenRoutes'
import type {RouteObject} from '@/types/routes'
import type {AppRouterSharedOptions} from './createAppDataRouter'

interface CreateAdminDataRoutesOptions extends AppRouterSharedOptions {
    hostname: string
}

function resolveAdminRoutePool(
    hostname: string,
    isAdminDomain: boolean,
): RouteObject[] {
    const isStoreDomain = hostname.startsWith('store.')
    if (isStoreDomain && !isAdminDomain) return []
    return flattenRoutes(adminRoutingRoutes)
}

export function createAdminDataRoutes(
    options: CreateAdminDataRoutesOptions,
) {
    const adminRoutes = resolveAdminRoutePool(
        options.hostname,
        options.isAdminDomain,
    )

    return adminRoutes.map((route) => ({
        path: route.path,
        element: (
            <RouteGuard
                route={route}
                isAuthenticated={options.isAuthenticated}
                isAdminDomain={options.isAdminDomain}
                onLoginSuccess={options.onLoginSuccess}
            />
        ),
    }))
}
