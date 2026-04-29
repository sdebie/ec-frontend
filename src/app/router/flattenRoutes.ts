import type {RouteObject} from '@/types/routes'

export function flattenRoutes(routes: RouteObject[]): RouteObject[] {
    return routes.flatMap((route) => [
        route,
        ...(route.subMenu ? flattenRoutes(route.subMenu) : []),
    ])
}
