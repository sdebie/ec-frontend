
import {flattenRoutes} from '@/app/router/flattenRoutes'
import {adminRoutingRoutes} from '@/configs/routes/admin/adminPageRoutes.config'
import RouteGuard from '@/configs/routes/RouteGuard'

import type {AppRouterSharedOptions} from './createAppDataRouter'
import type {RouteObject} from '@/types/routes'


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
