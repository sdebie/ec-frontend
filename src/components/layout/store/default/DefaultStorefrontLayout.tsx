import {ReactNode} from 'react'
import {DefaultStorefrontHeader} from "@/components/layout/store/default/DefaultStorefrontHeader.tsx";
import {DefaultStorefrontFooter} from "@/components/layout/store/default/DefaultStorefrontFooter.tsx";

interface StorefrontLayoutProps {
    children: ReactNode
    /** Optional custom header props */
    headerProps?: React.ComponentProps<typeof DefaultStorefrontHeader>
    /** Optional custom footer props */
    footerProps?: React.ComponentProps<typeof DefaultStorefrontFooter>
    /** Whether to show the footer (default: true) */
    showFooter?: boolean
    /** CSS class names for the main content container */
    contentClassName?: string
}

/**
 * DefaultStorefrontLayout
 * Main layout wrapper for storefront pages
 * Provides header, footer, and content area with theme support
 *
 * Usage:
 * <DefaultStorefrontLayout>
 *   <HomePage />
 * </DefaultStorefrontLayout>
 */
export function DefaultStorefrontLayout({
                                     children,
                                     headerProps,
                                     footerProps,
                                     showFooter = true,
                                     contentClassName = '',
                                 }: StorefrontLayoutProps) {

    return (
        <div
            className="flex flex-col min-h-screen"
            style={{
                backgroundColor: 'var(--storefront-color-background)',
                color: 'var(--storefront-color-text-primary)',
                fontFamily: 'var(--storefront-font-body)',
            }}
        >
            {/* Header */}
            <DefaultStorefrontHeader {...headerProps} />

            {/* Main Content */}
            <main className={`flex-1 ${contentClassName}`}>
                <div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
                    style={{
                        maxWidth: 'var(--storefront-spacing-container-max-width, 1280px)',
                    }}
                >
                    {children}
                </div>
            </main>

            {/* Footer */}
            {showFooter && <DefaultStorefrontFooter {...footerProps} />}
        </div>
    )
}

export default DefaultStorefrontLayout



