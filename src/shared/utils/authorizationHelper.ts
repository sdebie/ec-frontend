import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

export function hasRequiredAuthority(requiredAuthority: string[]): boolean {
  if (!requiredAuthority || requiredAuthority.length === 0) return true
  const { authority } = useAdminAuthStore.getState()
  return requiredAuthority.some(auth => authority.includes(auth))
}
