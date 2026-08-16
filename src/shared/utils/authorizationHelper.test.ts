import { describe, it, expect, beforeEach } from 'vitest'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { hasRequiredAuthority } from './authorizationHelper'

describe('hasRequiredAuthority', () => {
  beforeEach(() => {
    useAdminAuthStore.setState({ authority: [] })
  })

  it('returns true when requiredAuthority is an empty array', () => {
    expect(hasRequiredAuthority([])).toBe(true)
  })

  it('returns true when requiredAuthority is null', () => {
    expect(hasRequiredAuthority(null as unknown as string[])).toBe(true)
  })

  it('returns true when requiredAuthority is undefined', () => {
    expect(hasRequiredAuthority(undefined as unknown as string[])).toBe(true)
  })

  it('returns true when staff has at least one matching authority', () => {
    useAdminAuthStore.setState({ authority: ['MANAGE_PRODUCTS', 'VIEW_ORDERS'] })
    expect(hasRequiredAuthority(['MANAGE_PRODUCTS'])).toBe(true)
  })

  it('returns true when staff has one of multiple required authorities', () => {
    useAdminAuthStore.setState({ authority: ['VIEW_ORDERS'] })
    expect(hasRequiredAuthority(['MANAGE_PRODUCTS', 'VIEW_ORDERS'])).toBe(true)
  })

  it('returns false when staff has no matching authority', () => {
    useAdminAuthStore.setState({ authority: ['VIEW_ORDERS'] })
    expect(hasRequiredAuthority(['MANAGE_PRODUCTS'])).toBe(false)
  })

  it('returns false when staff has an empty authority list and requiredAuthority is non-empty', () => {
    useAdminAuthStore.setState({ authority: [] })
    expect(hasRequiredAuthority(['MANAGE_PRODUCTS'])).toBe(false)
  })

  it('reads from store state, not localStorage', () => {
    // Set store state directly — no localStorage interaction
    useAdminAuthStore.setState({ authority: ['MANAGE_STAFF'] })
    expect(hasRequiredAuthority(['MANAGE_STAFF'])).toBe(true)

    // Clear store state — even if localStorage had data, it should not matter
    useAdminAuthStore.setState({ authority: [] })
    expect(hasRequiredAuthority(['MANAGE_STAFF'])).toBe(false)
  })
})

