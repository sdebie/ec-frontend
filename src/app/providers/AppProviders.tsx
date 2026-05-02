import type {ComponentProps, PropsWithChildren} from 'react'
import {RouterProvider} from 'react-router-dom'
import {StorefrontCategoryProvider} from './StorefrontCategoryProvider'
import {StorefrontProvider} from './StorefrontProvider'
import type {ResolveStorefrontConfigOptions} from '@/storefront/registry/types'

interface AppProvidersProps extends PropsWithChildren {
    storefrontOptions?: ResolveStorefrontConfigOptions
    router: ComponentProps<typeof RouterProvider>['router']
}

/**
 * Dormant provider composition boundary.
 * Runtime ownership remains in App.tsx for Phase 1A.
 */
export function AppProviders({
    children,
    storefrontOptions,
    router,
}: AppProvidersProps) {
    return (
        <StorefrontProvider options={storefrontOptions}>
            <StorefrontCategoryProvider>
                <RouterProvider router={router} />
                {children}
            </StorefrontCategoryProvider>
        </StorefrontProvider>
    )
}

