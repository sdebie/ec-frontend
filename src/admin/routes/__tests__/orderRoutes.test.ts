import { describe, it, expect } from 'vitest'
import { matchRoutes } from 'react-router-dom'

import { adminMenuRoutes } from '../adminMenuRoutes.config'
import { adminRoutingRoutes } from '../adminPageRoutes.config'
import { buildAdminRouteObjects } from '@/app/router/buildAdminRoutes'

/**
 * The Orders section of the admin sidebar.
 *
 * Every page under Orders sits beneath `/admin/orders/…`, which is also where the order
 * detail route lives as `/admin/orders/:orderId`. That overlap is the risk this suite
 * exists for: a sub-page path is a literal that the dynamic segment would happily match,
 * and the failure is quiet — the shopper-facing detail page renders with "returns" as an
 * order id and reports "Order not found" rather than anything suggesting a routing bug.
 */

const ordersEntry = adminMenuRoutes.find((route) => route.key === 'admin.orders')

/** The read gate on orders: VIEWER may look, and only the two order roles may act. */
const ORDER_READ_ROLES = ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER']

describe('adminMenuRoutes — Orders section', () => {
  it('is a parent entry with no page of its own', () => {
    expect(ordersEntry).toBeDefined()
    expect(ordersEntry!.path).toBe('/admin/orders')
    // A parent that renders nothing: the sidebar expands it, and buildAdminRouteObjects
    // filters it out precisely because it has no component.
    expect(ordersEntry!.component).toBeUndefined()
  })

  it('lists its pages in the order the sidebar shows them', () => {
    expect(ordersEntry!.subMenu!.map((child) => child.key)).toEqual([
      'admin.orders.list',
      'admin.orders.returns',
      'admin.orders.abandoned-carts',
      'admin.orders.transactions',
    ])

    expect(ordersEntry!.subMenu!.map((child) => child.meta.label)).toEqual([
      'All Orders',
      'Return & Refund',
      'Abandoned Cart',
      'Transactions',
    ])
  })

  it('keeps All Orders on the section root, so the parent path lands somewhere real', () => {
    const list = ordersEntry!.subMenu!.find((c) => c.key === 'admin.orders.list')
    expect(list!.path).toBe('/admin/orders')
    expect(list!.component).toBeDefined()
  })

  /**
   * The placeholders are routed and reachable now, not left as menu entries that 404.
   * They render `AdminToDoPage`, which is reserved for exactly this.
   */
  it('routes every not-yet-built page to a real component', () => {
    for (const key of ['admin.orders.returns', 'admin.orders.abandoned-carts', 'admin.orders.transactions']) {
      const child = ordersEntry!.subMenu!.find((c) => c.key === key)
      expect(child, `${key} is missing`).toBeDefined()
      expect(child!.component, `${key} has no component and would 404`).toBeDefined()
    }
  })

  /**
   * A middle-privilege role, not just the extremes: a VIEWER must still reach these, and
   * a CATALOG_MANAGER must not — collapsing them onto the wrong gate would pass a
   * SUPER_ADMIN-vs-nobody check by accident.
   */
  it('gates every Orders page behind the same roles as the orders list', () => {
    for (const child of ordersEntry!.subMenu!) {
      expect(child.authority, `${child.key} has the wrong gate`).toEqual(ORDER_READ_ROLES)
      expect(child.authority).not.toContain('CATALOG_MANAGER')
    }
  })
})

describe('Orders sub-pages are not swallowed by the order detail route', () => {
  const routeObjects = buildAdminRouteObjects(adminRoutingRoutes)

  /**
   * React Router ranks a static segment above a dynamic one, so these should resolve to
   * themselves regardless of declaration order. Asserted rather than assumed: the whole
   * point is that getting it wrong is silent.
   */
  it.each([
    '/admin/orders/returns',
    '/admin/orders/abandoned-carts',
    '/admin/orders/transactions',
  ])('%s resolves to its own page, not to the order detail', (pathname) => {
    const matches = matchRoutes(routeObjects, pathname)

    expect(matches, `${pathname} matches no route at all`).not.toBeNull()
    expect(matches![matches!.length - 1].route.path).toBe(pathname)
  })

  it('still routes a real order id to the detail page', () => {
    const matches = matchRoutes(routeObjects, '/admin/orders/8f14e45f-ceea-467a-9f0b-2c1b0b7b1a11')

    expect(matches).not.toBeNull()
    expect(matches![matches!.length - 1].route.path).toBe('/admin/orders/:orderId')
  })

  it('registers each sub-page exactly once, so no two entries fight over a path', () => {
    const paths = routeObjects.map((r) => r.path)
    for (const pathname of [
      '/admin/orders',
      '/admin/orders/returns',
      '/admin/orders/abandoned-carts',
      '/admin/orders/transactions',
    ]) {
      expect(paths.filter((p) => p === pathname), `${pathname} is registered more than once`)
        .toHaveLength(1)
    }
  })
})
