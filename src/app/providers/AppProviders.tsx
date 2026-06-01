import {QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {RouterProvider} from 'react-router-dom'

import {queryClient} from '@/lib/queryClient'

import {SettingsInitializationProvider} from './SettingsInitializationProvider'
import {StorefrontCategoryProvider} from './StorefrontCategoryProvider'
import {StorefrontProvider} from './StorefrontProvider'

import type {ResolveStorefrontConfigOptions} from '@/configs/storefront/storefrontRegistryTypes'
import type {ComponentProps, PropsWithChildren} from 'react'

interface AppProvidersProps extends PropsWithChildren {
    storefrontOptions?: ResolveStorefrontConfigOptions
    router: ComponentProps<typeof RouterProvider>['router']
}

export function AppProviders({
                                 children,
                                 storefrontOptions,
                                 router,
                             }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <SettingsInitializationProvider>
                <StorefrontProvider options={storefrontOptions}>
                    <StorefrontCategoryProvider>
                        <RouterProvider router={router}/>
                        {children}
                    </StorefrontCategoryProvider>
                </StorefrontProvider>
            </SettingsInitializationProvider>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false}/>}
        </QueryClientProvider>
    )
}

