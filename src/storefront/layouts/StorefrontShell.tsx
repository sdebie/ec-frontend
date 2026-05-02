import type {StorefrontShellRenderProps} from '@/storefront/registry/types'
import {StorefrontThemeProvider} from '@/context/StorefrontThemeProvider.tsx'
import PageHeader from '@/pages/storefront/core/default/PageHeader.tsx'
import Footer from '@/components/layout/store/Footer.tsx'
import {Outlet} from 'react-router-dom'
import {StorefrontSlot} from '@/components/storefront/slots/StorefrontSlot.tsx'

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
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.header" />
            <PageHeader storefrontConfig={storefrontConfig} />
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="store.nav" />
            <main className="flex-1">{children ?? <Outlet />}</main>
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.footer" />
            <Footer
                branding={storefrontConfig.branding}
                footer={storefrontConfig.footer}
            />
        </StorefrontThemeProvider>
    )
}
