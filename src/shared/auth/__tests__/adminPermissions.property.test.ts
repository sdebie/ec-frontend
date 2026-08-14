import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { act, renderHook } from '@testing-library/react'
import { ADMIN_CAPABILITIES, roleCan, rolesFor, useCan } from '../adminPermissions'
import type { AdminCapability } from '../adminPermissions'
import { StaffRoles } from '@/shared/types/enums/StaffRoles'
import { useAdminAuthStore } from '../adminAuthStore'

const ALL_CAPABILITIES = Object.keys(ADMIN_CAPABILITIES) as AdminCapability[]
const STAFF_ROLE_VALUES = Object.values(StaffRoles)

/**
 * Pins the capability map to the backend's @RolesAllowed sets. A red row here
 * means either the map drifted or the backend contract changed — in the second
 * case update BOTH the map and this table.
 */
describe('ADMIN_CAPABILITIES mirrors the backend @RolesAllowed sets', () => {
  const EXPECTED: Record<AdminCapability, string[]> = {
    'product:write': ['SUPER_ADMIN', 'CATALOG_MANAGER'],
    'product:lifecycle': ['SUPER_ADMIN'],
    'featured:write': ['SUPER_ADMIN'],
    'brand:write': ['SUPER_ADMIN', 'CATALOG_MANAGER'],
    'category:write': ['SUPER_ADMIN', 'CATALOG_MANAGER'],
    'import:manage': ['SUPER_ADMIN', 'CATALOG_MANAGER'],
    'image:write': ['SUPER_ADMIN', 'CATALOG_MANAGER'],
    'order:write': ['SUPER_ADMIN', 'ORDER_MANAGER'],
    'quote:write': ['SUPER_ADMIN', 'ORDER_MANAGER'],
    'wholesale-application:decide': ['SUPER_ADMIN', 'ORDER_MANAGER'],
    'wholesale-customer:write': ['SUPER_ADMIN'],
    'customer:write': ['SUPER_ADMIN'],
    'settings:write': ['SUPER_ADMIN'],
    'staff:manage': ['SUPER_ADMIN'],
    'testimonial:write': ['SUPER_ADMIN'],
    'legal:write': ['SUPER_ADMIN'],
  }

  it('has exactly the expected capability keys', () => {
    expect(ALL_CAPABILITIES.sort()).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(ALL_CAPABILITIES)('%s admits exactly its backend role set', (capability) => {
    expect([...ADMIN_CAPABILITIES[capability]]).toEqual(EXPECTED[capability])
  })

  it('every capability role is a valid staff role', () => {
    for (const capability of ALL_CAPABILITIES) {
      for (const role of ADMIN_CAPABILITIES[capability]) {
        expect(STAFF_ROLE_VALUES).toContain(role)
      }
    }
  })

  it('every capability admits SUPER_ADMIN', () => {
    for (const capability of ALL_CAPABILITIES) {
      expect(roleCan(StaffRoles.SUPER_ADMIN, capability)).toBe(true)
    }
  })

  it('VIEWER holds no capability', () => {
    for (const capability of ALL_CAPABILITIES) {
      expect(roleCan(StaffRoles.VIEWER, capability)).toBe(false)
    }
  })
})

describe('roleCan — property tests', () => {
  const capabilityArb = fc.constantFrom(...ALL_CAPABILITIES)

  // Real roles, near-misses (case, padding, retired names), and arbitrary noise.
  const roleArb = fc.oneof(
    fc.constantFrom(...STAFF_ROLE_VALUES),
    fc.constantFrom(
      'super_admin',
      'Super_Admin',
      ' SUPER_ADMIN',
      'SUPER_ADMIN ',
      'ADMIN',
      'MANAGER',
      'catalog_manager',
      '',
    ),
    fc.string(),
    fc.constant(null),
  )

  it('roleCan(role, capability) is true iff role is exactly in the capability set', () => {
    fc.assert(
      fc.property(roleArb, capabilityArb, (role, capability) => {
        const expected =
          role != null && (ADMIN_CAPABILITIES[capability] as readonly string[]).includes(role)
        expect(roleCan(role, capability)).toBe(expected)
      }),
      { numRuns: 200 },
    )
  })

  it('rolesFor returns a fresh mutable copy of the capability set', () => {
    for (const capability of ALL_CAPABILITIES) {
      const roles = rolesFor(capability)
      expect(roles).toEqual([...ADMIN_CAPABILITIES[capability]])
      expect(roles).not.toBe(ADMIN_CAPABILITIES[capability])
      roles.push('MUTATED')
      expect(ADMIN_CAPABILITIES[capability] as readonly string[]).not.toContain('MUTATED')
    }
  })
})

describe('useCan — reacts to the session role', () => {
  it('tracks store role changes', () => {
    useAdminAuthStore.setState({ role: 'VIEWER' })
    const { result } = renderHook(() => useCan('brand:write'))
    expect(result.current).toBe(false)

    act(() => {
      useAdminAuthStore.setState({ role: 'CATALOG_MANAGER' })
    })
    expect(result.current).toBe(true)

    act(() => {
      useAdminAuthStore.setState({ role: null })
    })
    expect(result.current).toBe(false)
  })
})
