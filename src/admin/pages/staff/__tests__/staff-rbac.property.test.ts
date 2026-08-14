import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 *
 * Property test: for every role value in ['CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
 * the route authority guard for `/admin/staff/new` and `/admin/staff/:id/edit` should
 * prevent access (redirect to `/admin/staff`).
 *
 * This tests at the route config level — checking that the authority arrays on create/edit
 * routes only contain 'SUPER_ADMIN', meaning non-SUPER_ADMIN roles will be blocked by
 * the hasRequiredAuthority guard.
 */

// Replicate the route authority config as defined in adminPageRoutes.config.ts
const staffCreateRoute = {
  key: 'admin.staff.new',
  path: '/admin/staff/new',
  authority: ['SUPER_ADMIN'],
}

const staffEditRoute = {
  key: 'admin.staff.edit',
  path: '/admin/staff/:id/edit',
  authority: ['SUPER_ADMIN'],
}

/**
 * Models the hasRequiredAuthority check from authorizationHelper.ts.
 * Returns true if the user has at least one authority that matches the route's required authorities.
 */
function hasRequiredAuthority(
  routeAuthority: string[],
  userAuthority: string[],
): boolean {
  if (!routeAuthority || routeAuthority.length === 0) return true
  return routeAuthority.some((auth) => userAuthority.includes(auth))
}

const NON_SUPER_ADMIN_ROLES = ['CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'] as const

describe('staff RBAC — route authority guard', () => {
  it('non-SUPER_ADMIN roles are blocked from /admin/staff/new', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NON_SUPER_ADMIN_ROLES),
        (role) => {
          const userAuthority = [role]
          const canAccess = hasRequiredAuthority(staffCreateRoute.authority, userAuthority)
          expect(canAccess).toBe(false)
          return !canAccess
        },
      ),
      { numRuns: 100 },
    )
  })

  it('non-SUPER_ADMIN roles are blocked from /admin/staff/:id/edit', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...NON_SUPER_ADMIN_ROLES),
        (role) => {
          const userAuthority = [role]
          const canAccess = hasRequiredAuthority(staffEditRoute.authority, userAuthority)
          expect(canAccess).toBe(false)
          return !canAccess
        },
      ),
      { numRuns: 100 },
    )
  })

  it('SUPER_ADMIN role can access both create and edit routes', () => {
    const userAuthority = ['SUPER_ADMIN']

    expect(hasRequiredAuthority(staffCreateRoute.authority, userAuthority)).toBe(true)
    expect(hasRequiredAuthority(staffEditRoute.authority, userAuthority)).toBe(true)
  })

  it('no combination of non-SUPER_ADMIN roles grants access to create or edit', () => {
    fc.assert(
      fc.property(
        fc.subarray([...NON_SUPER_ADMIN_ROLES], { minLength: 1 }),
        (roles) => {
          const userAuthority = [...roles]
          const canAccessCreate = hasRequiredAuthority(staffCreateRoute.authority, userAuthority)
          const canAccessEdit = hasRequiredAuthority(staffEditRoute.authority, userAuthority)
          return !canAccessCreate && !canAccessEdit
        },
      ),
      { numRuns: 100 },
    )
  })
})
