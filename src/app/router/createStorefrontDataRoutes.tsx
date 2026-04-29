import {Outlet} from 'react-router-dom'
import {StorefrontRoutes} from '@/storefront/routes/StorefrontRoutes'
import {useStorefrontBoundary} from '@/app/providers/StorefrontProvider'
import {listStorefrontRouteContracts} from '@/configs/storefront/storefrontRouteContracts'
import {layoutRegistry} from '@/storefront/layouts/layoutRegistry'
import type {StorefrontLayoutId} from '@/storefront/registry/types'
import type {RouteMeta, RouteObject} from '@/types/routes'

export interface AppRouterStorefrontOptions {
    isAdminDomain: boolean
    activeCategory: string
    setActiveCategory: (value: string) => void
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

function StorefrontLayoutRoute({
    layout,
    activeCategory,
    setActiveCategory,
}: {
    layout: StorefrontLayoutId
    activeCategory: string
    setActiveCategory: (value: string) => void
}) {
    const {config: storefrontConfig} = useStorefrontBoundary()
    const Shell = layoutRegistry[layout] ?? layoutRegistry.default

    return (
        <Shell
            storefrontConfig={storefrontConfig}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
        >
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

    const storefrontRoutes: RouteObject[] = listStorefrontRouteContracts().map((contract) => ({
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }))
    const groupedRoutes = groupStorefrontRoutesByLayout(storefrontRoutes)

    return [
        {
            path: '/',
            children: groupedRoutes.map((group) => ({
                element: (
                    <StorefrontLayoutRoute
                        layout={group.layout}
                        activeCategory={options.activeCategory}
                        setActiveCategory={options.setActiveCategory}
                    />
                ),
                children: [
                    ...group.routes.map((route) => ({
                        ...toChildPath(route.path),
                        element: (
                            <StorefrontRoutes
                                route={route}
                                activeCategory={options.activeCategory}
                                setActiveCategory={options.setActiveCategory}
                            />
                        ),
                    })),
                ],
            })),
        },
    ]
}
