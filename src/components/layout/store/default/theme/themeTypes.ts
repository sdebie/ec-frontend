/**
 * Comprehensive storefront theme type definitions
 * Supports client-specific branding: colors, fonts, logos, spacing
 */

export type ColorMode = 'light' | 'dark'

export interface ThemeColors {
  /** Primary brand color - main actions, links, highlights */
  primary: string
  /** Secondary action color - alternative CTAs, accents */
  secondary: string
  /** Accent color - highlights, hover states, special elements */
  accent: string
  /** Page background color */
  background: string
  /** Card/container background color */
  surface: string
  /** Text colors with hierarchy */
  text: {
    /** Primary/main text - highest contrast */
    primary: string
    /** Secondary text - slightly muted */
    secondary: string
    /** Tertiary/muted text - lowest contrast */
    muted: string
  }
  /** Border color for dividers, inputs, cards */
  border: string
  /** Button-specific colors */
  button: {
    /** Primary button background */
    primary: string
    /** Primary button text */
    primaryText: string
    /** Secondary button background */
    secondary: string
    /** Secondary button text */
    secondaryText: string
  }
  /** Status/semantic colors */
  success?: string
  error?: string
  warning?: string
  info?: string
}

export interface ThemeFonts {
  /** Font family for headings (h1, h2, h3, etc.) */
  heading: string
  /** Font family for body text and general content */
  body: string
  /** Optional monospace font for code */
  mono?: string
}

export interface ThemeSpacing {
  /** Maximum width for container layout (default: 1280px) */
  containerMaxWidth?: string
  /** Base spacing unit in pixels (default: 4px) - actual gaps use this * multiplier */
  baseUnit?: number
}

export interface ThemeLogo {
  /** URL or path to logo image */
  url: string
  /** Alt text for logo */
  alt: string
  /** Optional logo width (px) */
  width?: number
  /** Optional logo height (px) */
  height?: number
}

export interface StorefrontThemeConfig {
  /** Unique identifier for this storefront */
  id: string

  /** Display name for the storefront */
  siteName: string

  /** Logo configuration */
  logo: ThemeLogo

  /** Brand description (used in meta tags, footer, etc.) */
  description?: string

  /** Color palette for the storefront */
  colors: ThemeColors

  /** Typography configuration */
  fonts: ThemeFonts

  /** Layout and spacing configuration */
  spacing?: ThemeSpacing

  /** Optional: Additional custom CSS variables (key: CSS variable name, value: CSS value) */
  customVariables?: Record<string, string>
}

export interface ResolvedStorefrontTheme extends StorefrontThemeConfig {
  /** CSS variables to apply to document */
  cssVariables: Record<string, string>
}

