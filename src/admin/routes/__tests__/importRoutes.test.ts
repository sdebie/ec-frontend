import { describe, it, expect } from 'vitest'
import { adminMenuRoutes } from '../adminMenuRoutes.config'
import { adminRoutingRoutes } from '../adminPageRoutes.config'

/**
 * Unit tests for import route configuration
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

describe('Import route configuration', () => {
  describe('adminMenuRoutes — admin.imports entry', () => {
    const importsEntry = adminMenuRoutes.find((route) => route.key === 'admin.imports')

    it('admin.imports entry exists with meta.section "IMPORTS"', () => {
      expect(importsEntry).toBeDefined()
      expect(importsEntry!.meta.section).toBe('IMPORTS')
    })

    it('admin.imports has a subMenu with exactly 2 children', () => {
      expect(importsEntry!.subMenu).toBeDefined()
      expect(importsEntry!.subMenu).toHaveLength(2)
    })

    it('children have correct paths', () => {
      const expectedPaths = [
        '/admin/imports/products/list',
        '/admin/imports/products/price/list',
      ]

      const actualPaths = importsEntry!.subMenu!.map((child) => child.path)
      expect(actualPaths).toEqual(expectedPaths)
    })

    it('both children have authority ["SUPER_ADMIN", "VIEWER"]', () => {
      const expectedAuthority = ['SUPER_ADMIN', 'VIEWER']

      importsEntry!.subMenu!.forEach((child) => {
        expect(child.authority).toEqual(expectedAuthority)
      })
    })
  })

  describe('adminRoutingRoutes — page-only import routes', () => {
    const pageOnlyPaths = [
      '/admin/imports/products/bulk-upload',
      '/admin/imports/products/bulk-upload/review/:batchId',
      '/admin/imports/products/price/bulk-upload',
      '/admin/imports/products/price/bulk-upload/review/:batchId',
    ]

    it.each(pageOnlyPaths)('contains route for %s', (path) => {
      const route = adminRoutingRoutes.find((r) => r.path === path)
      expect(route).toBeDefined()
    })

    it('all 4 page-only routes have authority ["SUPER_ADMIN", "VIEWER"]', () => {
      const expectedAuthority = ['SUPER_ADMIN', 'VIEWER']

      pageOnlyPaths.forEach((path) => {
        const route = adminRoutingRoutes.find((r) => r.path === path)
        expect(route).toBeDefined()
        expect(route!.authority).toEqual(expectedAuthority)
      })
    })
  })
})
