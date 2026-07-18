import { Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'
import type { AdminRouteList } from '@/admin/types/routes'
import { AdminRouteGuard } from './AdminRouteGuard'

function flattenRoutes(routes: AdminRouteList): AdminRouteList {
  return routes.flatMap((route) => [
    route,
    ...(route.subMenu ? flattenRoutes(route.subMenu) : []),
  ])
}

export function toAdminPageRoutes(routes: AdminRouteList): AdminRouteList {
  return flattenRoutes(routes).map(({ key, path, component, authority, meta }) => ({
    key,
    path,
    component,
    authority,
    meta,
  }))
}

export function buildAdminRouteObjects(routes: AdminRouteList): RouteObject[] {
  return flattenRoutes(routes)
    .filter((route) => route.path !== '/admin/login' && route.component != null)
    .map((route) => {
      const Component = route.component!
      return {
        path: route.path,
        element: (
          <AdminRouteGuard authority={route.authority}>
            <Suspense fallback={null}>
              <Component />
            </Suspense>
          </AdminRouteGuard>
        ),
      }
    })
}
