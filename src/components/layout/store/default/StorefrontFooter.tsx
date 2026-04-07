import {useStorefrontTheme} from '@/components/layout/store/default/theme'

interface StorefrontFooterProps {
    companyName?: string
    description?: string
    quickLinks?: Array<{ label: string; href: string }>
    socialLinks?: Array<{ icon: string; label: string; href: string }>
}

/**
 * StorefrontFooter
 * Footer component for storefront pages
 * Theme-aware with client-specific branding
 */
export function StorefrontFooter({
                                     companyName,
                                     description,
                                     quickLinks,
                                     socialLinks,
                                 }: StorefrontFooterProps) {
    const {config} = useStorefrontTheme()

    return (
        <footer
            style={{
                backgroundColor: 'var(--storefront-color-background)',
                borderTopColor: 'var(--storefront-color-border)',
                color: 'var(--storefront-color-text-secondary)',
            }}
            className="border-t mt-16 py-12"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Info */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            {config.logo.url && (
                                <img
                                    src={config.logo.url}
                                    alt={config.logo.alt}
                                    width={32}
                                    height={32}
                                />
                            )}
                            <span
                                className="font-semibold text-sm"
                                style={{color: 'var(--storefront-color-text-primary)'}}
                            >
                {companyName || config.siteName}
              </span>
                        </div>
                        <p className="text-sm">
                            {description || config.description || 'Your trusted online store'}
                        </p>
                    </div>

                    {/* Quick Links */}
                    {quickLinks && quickLinks.length > 0 && (
                        <div className="md:col-span-1">
                            <h3
                                className="font-semibold text-sm mb-4"
                                style={{color: 'var(--storefront-color-text-primary)'}}
                            >
                                Quick Links
                            </h3>
                            <ul className="space-y-2">
                                {quickLinks.map((link) => (
                                    <li key={link.href}>
                                        <a
                                            href={link.href}
                                            className="text-sm hover:opacity-75 transition-opacity"
                                            style={{color: 'var(--storefront-color-text-secondary)'}}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Customer Service */}
                    <div className="md:col-span-1">
                        <h3
                            className="font-semibold text-sm mb-4"
                            style={{color: 'var(--storefront-color-text-primary)'}}
                        >
                            Support
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Shipping Info
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Returns
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company Info */}
                    <div className="md:col-span-1">
                        <h3
                            className="font-semibold text-sm mb-4"
                            style={{color: 'var(--storefront-color-text-primary)'}}
                        >
                            Company
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-sm hover:opacity-75 transition-opacity"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="border-t pt-8"
                    style={{borderColor: 'var(--storefront-color-border)'}}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs">
                            © {new Date().getFullYear()} {companyName || config.siteName}. All rights reserved.
                        </p>
                        {socialLinks && socialLinks.length > 0 && (
                            <div className="flex gap-4">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm hover:opacity-75 transition-opacity"
                                        style={{color: 'var(--storefront-color-text-secondary)'}}
                                        aria-label={link.label}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default StorefrontFooter


