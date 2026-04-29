import type {StorefrontShellRenderProps} from '@/storefront/registry/types'
import {StorefrontThemeProvider} from '@/context/StorefrontThemeProvider.tsx'
import PageHeader from '@/pages/storefront/default/layout/PageHeader.tsx'
import Footer from '@/components/layout/store/Footer.tsx'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import {StorefrontSlot} from '@/components/storefront/slots/StorefrontSlot.tsx'

/**
 * Thin shell adapter over the current storefront composition in RouteGuard.
 */
export function StorefrontShell({
    storefrontConfig,
    activeCategory,
    onSelectCategory,
    children,
}: StorefrontShellRenderProps) {
    return (
        <StorefrontThemeProvider clientConfig={storefrontConfig}>
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.header" />
            <PageHeader
                activeCategory={activeCategory}
                onSelectCategory={onSelectCategory}
                storefrontConfig={storefrontConfig}
            />
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="store.nav" />
            <main className="flex-1">
                <Suspense fallback={<div className="mx-auto max-w-7xl p-8 text-(--sf-muted-text)">Loading storefront content...</div>}>
                    {children ?? <Outlet />}
                </Suspense>
            </main>
            <StorefrontSlot storefrontConfig={storefrontConfig} slotId="layout.footer" />
            <Footer
                branding={storefrontConfig.branding}
                footer={storefrontConfig.footer}
            />
        </StorefrontThemeProvider>
    )
}

