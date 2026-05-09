import {createBrowserRouter} from 'react-router-dom'

import {createAdminDataRoutes} from './createAdminDataRoutes'
import {createStorefrontDataRoutes} from './createStorefrontDataRoutes'

export interface AppRouterSharedOptions {
    isAdminDomain: boolean
    isAuthenticated: boolean
    onLoginSuccess: () => void
}

export interface AppRouterStorefrontOptions {
    isAdminDomain: boolean
}

interface CreateAppDataRouterOptions
    extends AppRouterSharedOptions,
        AppRouterStorefrontOptions {
    hostname: string
}

export function createAppDataRouter(options: CreateAppDataRouterOptions) {
    const adminRoutes = createAdminDataRoutes(options)
    const storefrontRoutes = createStorefrontDataRoutes(options)

    return createBrowserRouter([...adminRoutes, ...storefrontRoutes])
}
