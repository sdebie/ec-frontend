import type { PageMeta, PageRoute, PageRoutes, Route, Routes } from '@/@types/routes'

/**
 * Filter routes to get only menu-visible routes
 * Routes with hideInMenu: true are excluded
 *
 * @param routes - Array of routes to filter
 * @returns Filtered routes that should appear in menu/sidebar
 */
export const getMenuRoutes = (routes: Routes): Routes => {
    return routes.filter(route => !route.meta.hideInMenu)
}

/**
 * Filter routes to get all routing paths
 * (same as input, but provided for clarity)
 *
 * @param routes - Array of routes
 * @returns All routes including hidden ones
 */
export const getRoutingRoutes = (routes: Routes): Routes => {
    return routes
}

/**
 * Get visible routes in sidebar with recursive submenu filtering
 *
 * @param routes - Array of routes to filter
 * @returns Routes visible in sidebar with filtered submenus
 */
export const getVisibleMenuRoutes = (routes: Routes): Routes => {
    return routes
        .filter(route => !route.meta.hideInMenu)
        .map(route => ({
            ...route,
            subMenu: route.subMenu
                ? getVisibleMenuRoutes(route.subMenu)
                : undefined,
        }))
        .filter(route => !route.meta.hideInMenu || (route.subMenu && route.subMenu.length > 0))
}

/**
 * Get all routes recursively, including submenus
 * Flattens the route tree into a single array
 *
 * @param routes - Array of routes
 * @returns Flattened array of all routes and submenus
 */
export const flattenRoutes = (routes: Routes): Route[] => {
    return routes.flatMap((route) => [
        route,
        ...(route.subMenu ? flattenRoutes(route.subMenu) : [])
    ])
}

const toPageMeta = (meta: Route['meta']): PageMeta => ({
    pageContainerType: meta.pageContainerType,
    pageBackgroundType: meta.pageBackgroundType,
    header: meta.header,
    footer: meta.footer,
})

export const toPageRoutes = (routes: Routes): PageRoutes => {
    return routes.map((route): PageRoute => ({
        key: route.key,
        path: route.path,
        component: route.component,
        authority: route.authority,
        meta: toPageMeta(route.meta),
        subMenu: route.subMenu ? toPageRoutes(route.subMenu) : undefined,
    }))
}
