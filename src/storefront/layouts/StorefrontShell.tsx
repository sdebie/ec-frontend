import type {StorefrontShellRenderProps} from '@/storefront/registry/types'
import {StorefrontThemeProvider} from '@/context/StorefrontThemeProvider.tsx'
import PageHeader from '@/pages/shop/default/PageHeader.tsx'
import Footer from '@/components/layout/store/Footer.tsx'

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
            <PageHeader
                activeCategory={activeCategory}
                onSelectCategory={onSelectCategory}
                storefrontConfig={storefrontConfig}
            />
            <div>{children}</div>
            <Footer
                branding={storefrontConfig.branding}
                footer={storefrontConfig.footer}
            />
        </StorefrontThemeProvider>
    )
}

