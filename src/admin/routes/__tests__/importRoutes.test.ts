import { describe, it, expect } from 'vitest'
import { adminMenuRoutes } from '../adminMenuRoutes.config'
import { adminRoutingRoutes } from '../adminPageRoutes.config'
import { rolesFor } from '@/shared/auth/adminPermissions'

/**
 * Unit tests for import route configuration
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */

describe('Import route configuration', () => {
  describe('adminMenuRoutes — admin.imports entry', () => {
    const importsEntry = adminMenuRoutes.find((route) => route.key === 'admin.imports')

    it('admin.imports entry exists under section "PRODUCT MANAGEMENT"', () => {
      expect(importsEntry).toBeDefined()
      expect(importsEntry!.meta.section).toBe('PRODUCT MANAGEMENT')
    })

    it('admin.imports has a subMenu with exactly 3 children', () => {
      expect(importsEntry!.subMenu).toBeDefined()
      expect(importsEntry!.subMenu).toHaveLength(3)
    })

    it('children have correct paths', () => {
      const expectedPaths = [
        '/admin/images',
        '/admin/imports/products/list',
        '/admin/imports/products/price/list',
      ]

      const actualPaths = importsEntry!.subMenu!.map((child) => child.path)
      expect(actualPaths).toEqual(expectedPaths)
    })

    it('import children mirror the backend import/image role sets (no VIEWER — the batch reads deny it)', () => {
      importsEntry!.subMenu!
        .filter((child) => child.key !== 'admin.images')
        .forEach((child) => {
          expect(child.authority).toEqual(rolesFor('import:manage'))
        })
      const imagesChild = importsEntry!.subMenu!.find((child) => child.key === 'admin.images')
      expect(imagesChild!.authority).toEqual(rolesFor('image:write'))
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

    it('all 4 page-only routes carry the import:manage role set', () => {
      pageOnlyPaths.forEach((path) => {
        const route = adminRoutingRoutes.find((r) => r.path === path)
        expect(route).toBeDefined()
        expect(route!.authority).toEqual(rolesFor('import:manage'))
      })
    })
  })
})
