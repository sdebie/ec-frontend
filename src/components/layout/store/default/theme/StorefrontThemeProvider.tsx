import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { StorefrontThemeConfig, ResolvedStorefrontTheme } from './themeTypes.ts'
import { resolveThemeConfig, applyThemeConfig } from './defaultThemeConfig.ts'

interface StorefrontThemeContextValue {
  config: StorefrontThemeConfig
  resolved: ResolvedStorefrontTheme
}

const StorefrontThemeContext = createContext<StorefrontThemeContextValue | null>(null)

interface StorefrontThemeProviderProps {
  config: StorefrontThemeConfig
  children: ReactNode
}

/**
 * StorefrontThemeProvider
 * Applies theme configuration to the storefront
 * Sets CSS variables on document root for theme customization
 *
 * Usage:
 * <StorefrontThemeProvider config={myThemeConfig}>
 *   <App />
 * </StorefrontThemeProvider>
 */
export function StorefrontThemeProvider({
  config,
  children,
}: StorefrontThemeProviderProps) {
  const resolved = useMemo(() => resolveThemeConfig(config), [config])

  useEffect(() => {
    applyThemeConfig(config)
  }, [config])

  const value = useMemo<StorefrontThemeContextValue>(
    () => ({
      config,
      resolved,
    }),
    [config, resolved],
  )

  return (
    <StorefrontThemeContext.Provider value={value}>
      {children}
    </StorefrontThemeContext.Provider>
  )
}

/**
 * Hook to access the storefront theme configuration
 * Must be used within a StorefrontThemeProvider
 *
 * Usage:
 * const { config } = useStorefrontTheme()
 */
export function useStorefrontTheme(): StorefrontThemeContextValue {
  const context = useContext(StorefrontThemeContext)
  if (!context) {
    throw new Error(
      'useStorefrontTheme must be used within StorefrontThemeProvider',
    )
  }
  return context
}

