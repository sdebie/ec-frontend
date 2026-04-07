import type { StorefrontThemeConfig, ResolvedStorefrontTheme } from './themeTypes.ts'

/**
 * Default theme configuration - a reusable template for new clients
 * Provides a clean, professional storefront appearance
 * Easily customizable by clients
 */
export const defaultThemeConfig: StorefrontThemeConfig = {
  id: 'default',
  siteName: 'E-Commerce Store',

  logo: {
    url: '/logo.svg',
    alt: 'Store Logo',
    width: 40,
    height: 40,
  },

  description: 'Your trusted online store',

  colors: {
    // Brand primary color - blue
    primary: '#2563eb',

    // Secondary action color - slate
    secondary: '#64748b',

    // Accent for highlights
    accent: '#3b82f6',

    // Page backgrounds
    background: '#f8fafc',
    surface: '#ffffff',

    // Text hierarchy
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#94a3b8',
    },

    // Borders
    border: '#e2e8f0',

    // Button colors
    button: {
      primary: '#2563eb',
      primaryText: '#ffffff',
      secondary: '#e2e8f0',
      secondaryText: '#1e293b',
    },

    // Status colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
  },

  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },

  spacing: {
    containerMaxWidth: '1280px',
    baseUnit: 4, // 4px unit for spacing calculations
  },
}

/**
 * Converts theme config to resolved theme with CSS variables
 * Creates a flat CSS variable mapping for document style application
 */
export function resolveThemeConfig(config: StorefrontThemeConfig): ResolvedStorefrontTheme {
  const cssVariables: Record<string, string> = {
    // Brand
    '--storefront-site-name': config.siteName,

    // Colors - Primary
    '--storefront-color-primary': config.colors.primary,
    '--storefront-color-secondary': config.colors.secondary,
    '--storefront-color-accent': config.colors.accent,

    // Colors - Layout
    '--storefront-color-background': config.colors.background,
    '--storefront-color-surface': config.colors.surface,
    '--storefront-color-border': config.colors.border,

    // Colors - Text
    '--storefront-color-text-primary': config.colors.text.primary,
    '--storefront-color-text-secondary': config.colors.text.secondary,
    '--storefront-color-text-muted': config.colors.text.muted,

    // Colors - Button
    '--storefront-color-button-primary': config.colors.button.primary,
    '--storefront-color-button-primary-text': config.colors.button.primaryText,
    '--storefront-color-button-secondary': config.colors.button.secondary,
    '--storefront-color-button-secondary-text': config.colors.button.secondaryText,

    // Colors - Status
    ...(config.colors.success && { '--storefront-color-success': config.colors.success }),
    ...(config.colors.error && { '--storefront-color-error': config.colors.error }),
    ...(config.colors.warning && { '--storefront-color-warning': config.colors.warning }),
    ...(config.colors.info && { '--storefront-color-info': config.colors.info }),

    // Fonts
    '--storefront-font-heading': config.fonts.heading,
    '--storefront-font-body': config.fonts.body,
    ...(config.fonts.mono && { '--storefront-font-mono': config.fonts.mono }),

    // Spacing
    '--storefront-spacing-container-max-width': config.spacing?.containerMaxWidth || '1280px',
    '--storefront-spacing-base-unit': `${config.spacing?.baseUnit || 4}px`,
  }

  // Add any custom variables
  if (config.customVariables) {
    Object.assign(cssVariables, config.customVariables)
  }

  return {
    ...config,
    cssVariables,
  }
}

/**
 * Apply theme CSS variables to document root
 */
export function applyThemeConfig(config: StorefrontThemeConfig): void {
  const resolved = resolveThemeConfig(config)
  const root = document.documentElement

  Object.entries(resolved.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * Example theme config for a green/eco-friendly brand
 */
export const greenThemeConfig: StorefrontThemeConfig = {
  id: 'green-eco',
  siteName: 'Eco Store',
  logo: {
    url: '/logo-green.svg',
    alt: 'Eco Store Logo',
    width: 40,
    height: 40,
  },
  description: 'Sustainable products for a better tomorrow',
  colors: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: {
      primary: '#065f46',
      secondary: '#047857',
      muted: '#6ee7b7',
    },
    border: '#d1fae5',
    button: {
      primary: '#10b981',
      primaryText: '#ffffff',
      secondary: '#d1fae5',
      secondaryText: '#065f46',
    },
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
}

/**
 * Example theme config for a luxury/premium brand
 */
export const luxuryThemeConfig: StorefrontThemeConfig = {
  id: 'luxury-gold',
  siteName: 'Luxury Boutique',
  logo: {
    url: '/logo-luxury.svg',
    alt: 'Luxury Boutique Logo',
    width: 50,
    height: 50,
  },
  description: 'Premium luxury goods and exclusive collections',
  colors: {
    primary: '#78350f',
    secondary: '#92400e',
    accent: '#d97706',
    background: '#faf8f3',
    surface: '#ffffff',
    text: {
      primary: '#78350f',
      secondary: '#92400e',
      muted: '#b45309',
    },
    border: '#fed7aa',
    button: {
      primary: '#78350f',
      primaryText: '#fef3c7',
      secondary: '#fed7aa',
      secondaryText: '#78350f',
    },
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Lato", sans-serif',
    mono: '"Courier New", monospace',
  },
}

