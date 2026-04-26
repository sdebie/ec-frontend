import type {StorefrontTheme} from '@/types/storefront/storefrontTypes.ts'

/**
 * Thin token-applier extracted from the current StorefrontThemeProvider mapping.
 */
export function applyStorefrontTheme(
    theme: StorefrontTheme,
    root: HTMLElement = document.documentElement,
): void {
    const vars: Record<string, string> = {
        '--sf-bg': theme.background,
        '--sf-panel': theme.panel,
        '--sf-text': theme.text,
        '--sf-muted-text': theme.mutedText,
        '--sf-accent': theme.accent,
        '--sf-accent-text': theme.accentText,
        '--sf-border': theme.border,
        '--sf-nav-bg': theme.navBackground || theme.panel,
        '--sf-nav-text': theme.navText || theme.text,
        '--sf-nav-text-hover': theme.navTextHover || theme.accent,
        '--sf-nav-border': theme.navBorder || theme.border,
        '--sf-nav-icon-text': theme.navIconText || theme.mutedText,
        '--sf-nav-icon-text-hover': theme.navIconTextHover || theme.accent,
        // Status tokens
        '--sf-error': theme.error || '#ef4444',
        '--sf-success': theme.success || '#10b981',
    }

    Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
    })
}

