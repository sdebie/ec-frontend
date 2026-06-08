import {Outlet} from 'react-router-dom'


import {layoutRegistry} from '@/app/layouts/storefront/layoutRegistry'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import {StorefrontRoutes} from '@/configs/routes/store/StorefrontRoutes'
import {resolveActiveStorefrontConfig} from '@/configs/storefront/resolveStorefrontConfig'
import {resolveStorefrontConventionPage} from '@/configs/storefront/storefrontPageConventionRegistry'
import {listStorefrontRouteContracts} from '@/configs/storefront/storefrontRouteContracts'

import type {StorefrontLayoutId} from '@/configs/storefront/storefrontRegistryTypes'
import type {RouteMeta, RouteObject} from '@/types/routes'


export interface AppRouterStorefrontOptions {
    isAdminDomain: boolean
    hostname: string
}

interface GroupedStorefrontRoute {
    layout: StorefrontLayoutId
    routes: RouteObject[]
}

function groupStorefrontRoutesByLayout(
    routes: RouteObject[],
): GroupedStorefrontRoute[] {
    const grouped = new Map<StorefrontLayoutId, RouteObject[]>()

    for (const route of routes) {
        const layout =
            (route.meta?.layout as StorefrontLayoutId | undefined) ?? 'default'
        if (!grouped.has(layout)) grouped.set(layout, [])
        grouped.get(layout)!.push(route)
    }

    return [...grouped.entries()].map(([layout, groupedRoutes]) => ({
        layout,
        routes: groupedRoutes,
    }))
}

function toChildPath(path: string): {index?: boolean; path?: string} {
    if (path === '/') return {index: true}
    return {path: path.replace(/^\//, '')}
}

function StorefrontLayoutRoute({layout}: {layout: StorefrontLayoutId}) {
    const {config: storefrontConfig} = useStorefrontBoundary()
    const Shell = layoutRegistry[layout] ?? layoutRegistry.default

    return (
        <Shell storefrontConfig={storefrontConfig}>
            <Outlet />
        </Shell>
    )
}

export function createStorefrontDataRoutes(
    options: AppRouterStorefrontOptions,
) {
    if (options.isAdminDomain) {
        return []
    }

    const baseRoutes: RouteObject[] = listStorefrontRouteContracts().map((contract) => ({
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }))

    const tenantConfig = resolveActiveStorefrontConfig({ hostname: options.hostname })
    const extraRoutes: RouteObject[] = (tenantConfig.routes?.extra ?? []).flatMap((extraRoute) => {
        const component = resolveStorefrontConventionPage(tenantConfig.id, extraRoute.key)
        if (!component) return []
        return [{
            key: extraRoute.key,
            path: extraRoute.path,
            component,
            authority: [],
            meta: { layout: extraRoute.meta?.layout ?? 'default', headerTitle: extraRoute.meta?.title } as RouteMeta,
        }]
    })

    const storefrontRoutes = [...baseRoutes, ...extraRoutes]
    const groupedRoutes = groupStorefrontRoutesByLayout(storefrontRoutes)

    return [
        {
            path: '/',
            children: groupedRoutes.map((group) => ({
                element: <StorefrontLayoutRoute layout={group.layout} />,
                children: [
                    ...group.routes.map((route) => ({
                        ...toChildPath(route.path),
                        element: <StorefrontRoutes route={route} />,
                    })),
                ],
            })),
        },
    ]
}
