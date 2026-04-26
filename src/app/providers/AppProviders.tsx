import type {PropsWithChildren} from 'react'
import {BrowserRouter} from 'react-router-dom'
import {StorefrontProvider} from './StorefrontProvider'
import type {ResolveStorefrontConfigOptions} from '@/storefront/registry/types'

interface AppProvidersProps extends PropsWithChildren {
    storefrontOptions?: ResolveStorefrontConfigOptions
}

/**
 * Dormant provider composition boundary.
 * Runtime ownership remains in App.tsx for Phase 1A.
 */
export function AppProviders({
    children,
    storefrontOptions,
}: AppProvidersProps) {
    return (
        <BrowserRouter>
            <StorefrontProvider options={storefrontOptions}>
                {children}
            </StorefrontProvider>
        </BrowserRouter>
    )
}

