import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';
import type {CSSProperties, PropsWithChildren} from 'react';

interface StorefrontThemeProviderProps extends PropsWithChildren {
    clientConfig: StorefrontClientConfig;
}

export const StorefrontThemeProvider = ({
                                            children,
                                            clientConfig,
                                        }: StorefrontThemeProviderProps) => {
    const vars: CSSProperties = {
        ['--sf-bg' as string]: clientConfig.theme.background,
        ['--sf-panel' as string]: clientConfig.theme.panel,
        ['--sf-text' as string]: clientConfig.theme.text,
        ['--sf-muted-text' as string]: clientConfig.theme.mutedText,
        ['--sf-accent' as string]: clientConfig.theme.accent,
        ['--sf-accent-text' as string]: clientConfig.theme.accentText,
        ['--sf-border' as string]: clientConfig.theme.border,

        // NEW: Navigation theme tokens
        ['--sf-nav-bg' as string]: clientConfig.theme.navBackground || clientConfig.theme.panel,
        ['--sf-nav-text' as string]: clientConfig.theme.navText || clientConfig.theme.text,
        ['--sf-nav-text-hover' as string]: clientConfig.theme.navTextHover || clientConfig.theme.accent,
        ['--sf-nav-border' as string]: clientConfig.theme.navBorder || clientConfig.theme.border,
        ['--sf-nav-icon-text' as string]: clientConfig.theme.navIconText || clientConfig.theme.mutedText,
        ['--sf-nav-icon-text-hover' as string]: clientConfig.theme.navIconTextHover || clientConfig.theme.accent,

        // Status tokens
        ['--sf-error' as string]: clientConfig.theme.error || '#ef4444',
        ['--sf-success' as string]: clientConfig.theme.success || '#10b981',
        ['--sf-surface-muted' as string]: clientConfig.theme.surfaceMuted || '#f8fafc',
        ['--sf-ring' as string]: clientConfig.theme.ring || clientConfig.theme.accent,
        ['--sf-radius' as string]: clientConfig.theme.radius || '1rem',
        ['--sf-shadow-sm' as string]:
            clientConfig.theme.shadowSm || '0 8px 20px -18px rgba(15, 23, 42, 0.35)',
        ['--sf-shadow-lg' as string]:
            clientConfig.theme.shadowLg || '0 24px 44px -28px rgba(15, 23, 42, 0.45)',
    };

    return (
        <div
            data-storefront-client={clientConfig.id}
            style={vars}
            className="min-h-screen flex flex-col bg-(--sf-bg) text-(--sf-text)"
        >
            {children}
        </div>
    );
};
