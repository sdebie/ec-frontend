import {Route, Routes} from 'react-router-dom'
import RouteGuard from '@/configs/routes/RouteGuard.tsx'
import {StorefrontRoutes} from '@/storefront/routes/StorefrontRoutes.tsx'
import type {RouteObject} from '@/types/routes.ts'

interface AppRouterProps {
    routes: RouteObject[]
    isAuthenticated: boolean
    isAdminDomain: boolean
    activeCategory: string
    setActiveCategory: (value: string) => void
    onLoginSuccess: () => void
}

export function flattenRoutes(routes: RouteObject[]): RouteObject[] {
    return routes.flatMap((route) => [
        route,
        ...(route.subMenu ? flattenRoutes(route.subMenu) : []),
    ])
}

/**
 * Router boundary — StorefrontProvider is the single runtime config source.
 */
export function AppRouter({
    routes,
    isAuthenticated,
    isAdminDomain,
    activeCategory,
    setActiveCategory,
    onLoginSuccess,
}: AppRouterProps) {

    const allRoutes = flattenRoutes(routes)
    const adminRoutes = allRoutes.filter((route) => route.path.startsWith('/admin'))
    const storefrontRoutes = allRoutes.filter((route) => !route.path.startsWith('/admin'))

    return (
        <Routes>
            {adminRoutes.map((route) => (
                <Route
                    key={route.key}
                    path={route.path}
                    element={
                        <RouteGuard
                            route={route}
                            isAuthenticated={isAuthenticated}
                            isAdminDomain={isAdminDomain}
                            onLoginSuccess={onLoginSuccess}
                        />
                    }
                />
            ))}
            {storefrontRoutes.map((route) => (
                <Route
                    key={route.key}
                    path={route.path}
                    element={
                        <StorefrontRoutes
                            route={route}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                        />
                    }
                />
            ))}
        </Routes>
    )
}

