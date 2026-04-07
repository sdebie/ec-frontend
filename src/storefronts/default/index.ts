/**
 * Storefront configuration loader
 * Loads the appropriate theme config based on environment or hostname
 */

import { defaultStorefrontTheme } from './theme.config'
import type { StorefrontThemeConfig } from '@/components/layout/store/default/theme'

/**
 * Get the storefront theme config
 * Currently returns the default theme
 *
 * In a multi-tenant setup, you could:
 * - Load based on hostname/subdomain
 * - Load from API
 * - Load from environment variables
 */
export function getStorefrontThemeConfig(): StorefrontThemeConfig {
  // For now, always use the default theme
  // Later, this could be:
  // const hostname = getHostname()
  // return loadThemeForClient(hostname)

  return defaultStorefrontTheme
}

/**
 * Example: Load theme based on hostname
 * Uncomment and customize for multi-tenant setup
 */
/*
function loadThemeForClient(hostname: string): StorefrontThemeConfig {
  // Remove any subdomains and get the main domain
  const domainParts = hostname.split('.')
  const clientId = domainParts[0]

  // Map client IDs to theme configs
  const themeMap: Record<string, StorefrontThemeConfig> = {
    'default': defaultStorefrontTheme,
    'ecoshop': ecoFriendlyTheme,
    'prestige': luxuryFashionTheme,
    'localhost': defaultStorefrontTheme,
  }

  return themeMap[clientId] || defaultStorefrontTheme
}
*/

