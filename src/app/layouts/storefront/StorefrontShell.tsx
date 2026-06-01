import {Outlet} from 'react-router-dom'


import PageHeader from '@/app/layouts/storefront/PageHeader.tsx'
import Footer from '@/components/storefront/sections/Footer.tsx'
import {StorefrontSlot} from '@/components/storefront/slots/StorefrontSlot.tsx'
import {StorefrontThemeProvider} from '@/context/StorefrontThemeProvider.tsx'
import {SurfaceProvider} from '@/primitives/surface'

import type {StorefrontShellRenderProps} from '@/configs/storefront/storefrontRegistryTypes'

/**
 * Thin shell adapter over the current storefront composition in RouteGuard.
 * Lazy route Suspense lives in StorefrontRoutes (single primary boundary).
 */
export function StorefrontShell({
                                    storefrontConfig,
                                    children,
                                }: StorefrontShellRenderProps) {
    return (
        <StorefrontThemeProvider clientConfig={storefrontConfig}>
            <SurfaceProvider surface="storefront">
                <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.header"/>
                <PageHeader storefrontConfig={storefrontConfig}/>
                <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.below-header"/>
                <StorefrontSlot storefrontConfig={storefrontConfig} slotId="store.nav"/>
                <main className="flex-1">{children ?? <Outlet/>}</main>
                <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.footer"/>
                <Footer
                    branding={storefrontConfig.branding}
                    footer={storefrontConfig.footer}
                />
            </SurfaceProvider>
        </StorefrontThemeProvider>
    )
}
