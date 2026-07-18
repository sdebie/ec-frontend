import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

export function hasRequiredAuthority(requiredAuthority: string[]): boolean {
  if (!requiredAuthority || requiredAuthority.length === 0) return true
  const { authority } = useAdminAuthStore.getState()
  return requiredAuthority.some(auth => authority.includes(auth))
}

/**
 * Returns true when the current staff user has a catalog-write role
 * (SUPER_ADMIN or CATALOG_MANAGER). ORDER_MANAGER and VIEWER are read-only.
 */
export function canManageCatalog(): boolean {
  return hasRequiredAuthority(['SUPER_ADMIN', 'CATALOG_MANAGER'])
}
