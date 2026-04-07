/**
 * Default Storefront Configuration
 * This is the configuration file for the first client storefront
 *
 * To create a new client storefront:
 * 1. Copy this file to storefronts/{client-id}/theme.config.ts
 * 2. Update the branding (siteName, logo, colors, fonts)
 * 3. Import and use in your app's StorefrontThemeProvider
 *
 * Example for a new client:
 *
 * // storefronts/luxury-boutique/theme.config.ts
 * import { StorefrontThemeConfig } from '@/store/theme'
 *
 * export const luxuryBoutiqueTheme: StorefrontThemeConfig = {
 *   id: 'luxury-boutique',
 *   siteName: 'Luxury Boutique',
 *   logo: {
 *     url: '/logos/luxury-boutique-logo.svg',
 *     alt: 'Luxury Boutique',
 *     width: 45,
 *     height: 45,
 *   },
 *   // ... rest of config
 * }
 */

import { StorefrontThemeConfig } from '@/components/layout/store/default/theme'

export const defaultStorefrontTheme: StorefrontThemeConfig = {
  id: 'default',
  siteName: 'E-Commerce Store',

  logo: {
    url: '/logo.svg',
    alt: 'Store Logo',
    width: 40,
    height: 40,
  },

  description: 'Your trusted online store - Quality products at great prices',

  colors: {
    // Primary brand color - used for main CTAs and highlights
    primary: '#2563eb',

    // Secondary action color
    secondary: '#64748b',

    // Accent color for special highlights
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

    // Borders and dividers
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
    // System font stack for headings
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    // System font stack for body text
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
    // Optional monospace font
    mono: '"Fira Code", "Courier New", monospace',
  },

  spacing: {
    containerMaxWidth: '1280px',
    baseUnit: 4,
  },
}

/**
 * Example: Eco-friendly brand storefront
 * Demonstrates how to customize the theme for a different industry/brand
 */
export const ecoFriendlyTheme: StorefrontThemeConfig = {
  id: 'eco-friendly',
  siteName: 'EcoShop - Sustainable Living',

  logo: {
    url: '/logos/ecoshop-logo.svg',
    alt: 'EcoShop Logo',
    width: 40,
    height: 40,
  },

  description: 'Sustainable products for a better planet',

  colors: {
    primary: '#10b981',      // Green for eco-friendly brand
    secondary: '#059669',
    accent: '#34d399',
    background: '#f0fdf4',   // Very light green
    surface: '#ffffff',
    text: {
      primary: '#065f46',    // Dark green
      secondary: '#047857',
      muted: '#6ee7b7',
    },
    border: '#d1fae5',       // Light green border
    button: {
      primary: '#10b981',
      primaryText: '#ffffff',
      secondary: '#d1fae5',
      secondaryText: '#065f46',
    },
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
  },

  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"Courier New", monospace',
  },

  spacing: {
    containerMaxWidth: '1280px',
    baseUnit: 4,
  },
}

/**
 * Example: Luxury fashion brand storefront
 * Shows how to create a premium brand feel
 */
export const luxuryFashionTheme: StorefrontThemeConfig = {
  id: 'luxury-fashion',
  siteName: 'Prestige Couture',

  logo: {
    url: '/logos/prestige-couture-logo.svg',
    alt: 'Prestige Couture',
    width: 50,
    height: 50,
  },

  description: 'Luxury fashion and exclusive collections',

  colors: {
    primary: '#78350f',      // Elegant brown/gold
    secondary: '#92400e',
    accent: '#d97706',
    background: '#faf8f3',   // Cream/beige background
    surface: '#ffffff',
    text: {
      primary: '#78350f',    // Dark brown
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
    info: '#0ea5e9',
  },

  fonts: {
    // High-end serif fonts for luxury brand
    heading: '"Playfair Display", serif, -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"Courier New", monospace',
  },

  spacing: {
    containerMaxWidth: '1280px',
    baseUnit: 4,
  },
}

