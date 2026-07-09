import { createContext, useContext } from 'react'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

export const StorefrontConfigContext = createContext<StorefrontConfig | null>(null)

export function useStorefrontConfig(): StorefrontConfig {
  const ctx = useContext(StorefrontConfigContext)
  if (!ctx) {
    throw new Error('useStorefrontConfig must be used within StorefrontConfigProvider')
  }
  return ctx
}
