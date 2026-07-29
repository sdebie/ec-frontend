import { describe, it, expect } from 'vitest'
import { adminMenuRoutes } from '../adminMenuRoutes.config'
import { adminRoutingRoutes } from '../adminPageRoutes.config'

/**
 * Unit tests for wholesale route configuration
 *
 * Validates: Requirements 6.1, 6.2, 6.3
 */

describe('Wholesale route configuration', () => {
  describe('adminMenuRoutes — admin.wholesale entry', () => {
    const wholesaleEntry = adminMenuRoutes.find((route) => route.key === 'admin.wholesale')

    it('admin.wholesale entry exists', () => {
      expect(wholesaleEntry).toBeDefined()
    })

    it('admin.wholesale has path /admin/wholesale', () => {
      expect(wholesaleEntry!.path).toBe('/admin/wholesale')
    })

    it('admin.wholesale has authority ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"]', () => {
      expect(wholesaleEntry!.authority).toEqual(['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'])
    })

    it('admin.wholesale has meta.section "CUSTOMER MANAGEMENT"', () => {
      expect(wholesaleEntry!.meta.section).toBe('CUSTOMER MANAGEMENT')
    })

    it('admin.wholesale has meta.icon "warehouse"', () => {
      expect(wholesaleEntry!.meta.icon).toBe('warehouse')
    })

    it('admin.wholesale has a subMenu with exactly 2 entries', () => {
      expect(wholesaleEntry!.subMenu).toBeDefined()
      expect(wholesaleEntry!.subMenu).toHaveLength(2)
    })

    describe('subMenu — admin.wholesale.applications', () => {
      const applicationsEntry = wholesaleEntry!.subMenu!.find(
        (route) => route.key === 'admin.wholesale.applications'
      )

      it('exists with correct key', () => {
        expect(applicationsEntry).toBeDefined()
      })

      it('has path /admin/wholesale', () => {
        expect(applicationsEntry!.path).toBe('/admin/wholesale')
      })

      it('has menuMatch "exact"', () => {
        expect(applicationsEntry!.meta.menuMatch).toBe('exact')
      })

      it('has authority ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"]', () => {
        expect(applicationsEntry!.authority).toEqual(['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'])
      })
    })

    describe('subMenu — admin.wholesale.customers', () => {
      const customersEntry = wholesaleEntry!.subMenu!.find(
        (route) => route.key === 'admin.wholesale.customers'
      )

      it('exists with correct key', () => {
        expect(customersEntry).toBeDefined()
      })

      it('has path /admin/wholesale/customers', () => {
        expect(customersEntry!.path).toBe('/admin/wholesale/customers')
      })

      it('has authority ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"]', () => {
        expect(customersEntry!.authority).toEqual(['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'])
      })
    })
  })

  describe('adminRoutingRoutes — wholesale customer detail', () => {
    const detailRoute = adminRoutingRoutes.find(
      (route) => route.key === 'admin.wholesale.customers.detail'
    )

    it('detail route exists in adminRoutingRoutes', () => {
      expect(detailRoute).toBeDefined()
    })

    it('has path /admin/wholesale/customers/:customerId', () => {
      expect(detailRoute!.path).toBe('/admin/wholesale/customers/:customerId')
    })

    it('has authority ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"]', () => {
      expect(detailRoute!.authority).toEqual(['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'])
    })
  })

  describe('detail route is NOT in adminMenuRoutes', () => {
    it('admin.wholesale.customers.detail is not a top-level menu entry', () => {
      const topLevelMatch = adminMenuRoutes.find(
        (route) => route.key === 'admin.wholesale.customers.detail'
      )
      expect(topLevelMatch).toBeUndefined()
    })

    it('admin.wholesale.customers.detail is not in any subMenu', () => {
      const allSubMenuKeys = adminMenuRoutes
        .flatMap((route) => route.subMenu ?? [])
        .map((sub) => sub.key)

      expect(allSubMenuKeys).not.toContain('admin.wholesale.customers.detail')
    })
  })
})
