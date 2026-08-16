import { describe, it, expect } from 'vitest'
import { adminRoutingRoutes } from '../adminPageRoutes.config'
import { adminMenuRoutes } from '../adminMenuRoutes.config'

/**
 * Role-matrix tests for product create/edit route authority configuration.
 * Asserts that SUPER_ADMIN and CATALOG_MANAGER have write access to product
 * create/edit routes, while ORDER_MANAGER and VIEWER are excluded.
 *
 */
describe('Product route authority (role-matrix)', () => {
  const productCreateRoute = adminRoutingRoutes.find((r) => r.key === 'admin.products.new')
  const productEditRoute = adminRoutingRoutes.find((r) => r.key === 'admin.products.edit')

  describe('product create route (/admin/products/new)', () => {
    it('exists in route config', () => {
      expect(productCreateRoute).toBeDefined()
    })

    it('allows SUPER_ADMIN', () => {
      expect(productCreateRoute!.authority).toContain('SUPER_ADMIN')
    })

    it('allows CATALOG_MANAGER', () => {
      expect(productCreateRoute!.authority).toContain('CATALOG_MANAGER')
    })

    it('does not allow ORDER_MANAGER', () => {
      expect(productCreateRoute!.authority).not.toContain('ORDER_MANAGER')
    })

    it('does not allow VIEWER', () => {
      expect(productCreateRoute!.authority).not.toContain('VIEWER')
    })
  })

  describe('product edit route (/admin/products/:productId/edit)', () => {
    it('exists in route config', () => {
      expect(productEditRoute).toBeDefined()
    })

    it('allows SUPER_ADMIN', () => {
      expect(productEditRoute!.authority).toContain('SUPER_ADMIN')
    })

    it('allows CATALOG_MANAGER', () => {
      expect(productEditRoute!.authority).toContain('CATALOG_MANAGER')
    })

    it('does not allow ORDER_MANAGER', () => {
      expect(productEditRoute!.authority).not.toContain('ORDER_MANAGER')
    })

    it('does not allow VIEWER', () => {
      expect(productEditRoute!.authority).not.toContain('VIEWER')
    })
  })

  describe('product list route (read-only, accessible to all staff)', () => {
    // The product list is in the menu routes, under the products submenu
    const productsMenu = adminMenuRoutes.find((r) => r.key === 'admin.products')
    const productListRoute = productsMenu?.subMenu?.find((r) => r.key === 'admin.products.list')

    it('product list route exists', () => {
      expect(productListRoute).toBeDefined()
    })

    it('allows VIEWER to view product list (read-only)', () => {
      expect(productListRoute!.authority).toContain('VIEWER')
    })

    it('allows SUPER_ADMIN to view product list', () => {
      expect(productListRoute!.authority).toContain('SUPER_ADMIN')
    })
  })
})
