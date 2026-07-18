import { describe, it, expect } from 'vitest'
import { adminMenuRoutes } from '../adminMenuRoutes.config'

/**
 * Unit test for sidebar route configuration — admin.products parent entry
 *
 * Validates: Requirements 8.1, 8.2, 8.5
 */

describe('adminMenuRoutes — admin.products configuration', () => {
  const productsEntry = adminMenuRoutes.find((route) => route.key === 'admin.products')

  it('admin.products entry exists with correct key and path', () => {
    expect(productsEntry).toBeDefined()
    expect(productsEntry!.key).toBe('admin.products')
    expect(productsEntry!.path).toBe('/admin/products')
  })

  it('admin.products parent has no component', () => {
    expect(productsEntry!.component).toBeUndefined()
  })

  it('admin.products has a subMenu with exactly 6 children', () => {
    expect(productsEntry!.subMenu).toBeDefined()
    expect(productsEntry!.subMenu).toHaveLength(6)
  })

  it('children have correct keys', () => {
    const expectedKeys = [
      'admin.products.list',
      'admin.products.brands',
      'admin.products.categories',
      'admin.products.on-sale',
      'admin.products.by-category',
      'admin.products.by-brand',
    ]

    const actualKeys = productsEntry!.subMenu!.map((child) => child.key)
    expect(actualKeys).toEqual(expectedKeys)
  })

  it('children have correct paths', () => {
    const expectedPaths = [
      '/admin/products',
      '/admin/products/brands',
      '/admin/products/categories',
      '/admin/products/on-sale',
      '/admin/products/by-category',
      '/admin/products/by-brand',
    ]

    const actualPaths = productsEntry!.subMenu!.map((child) => child.path)
    expect(actualPaths).toEqual(expectedPaths)
  })

  it('makes the product list readable by all staff while keeping the other product sections restricted', () => {
    const listRoute = productsEntry!.subMenu!.find((child) => child.key === 'admin.products.list')
    const otherRoutes = productsEntry!.subMenu!.filter((child) => child.key !== 'admin.products.list')

    expect(productsEntry!.authority).toEqual(['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'])
    expect(listRoute!.authority).toEqual(['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'])
    otherRoutes.forEach((child) => {
      expect(child.authority).toEqual(['SUPER_ADMIN', 'VIEWER'])
    })
  })
})
