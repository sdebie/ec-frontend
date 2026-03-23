import type { Route } from '@/@types/routes.tsx'

export const isRouteVisibleInSidebar = (route: Route): boolean => {
    if (typeof route.meta.showInSidebar === 'boolean') {
        return route.meta.showInSidebar
    }

    return !route.meta.hideInMenu
}

