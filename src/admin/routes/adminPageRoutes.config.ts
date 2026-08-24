import {lazy} from 'react'
import {toAdminPageRoutes} from '@/app/router/buildAdminRoutes'
import {adminMenuRoutes} from './adminMenuRoutes.config'
import {rolesFor} from '@/shared/auth/adminPermissions'
import type {AdminRouteList} from '@/admin/types/routes'

const adminPageOnlyRoutes: AdminRouteList = [
    {
        key: 'admin.login',
        path: '/admin/login',
        component: lazy(() =>
            import('@/admin/pages/AdminLoginPage').then((m) => ({default: m.AdminLoginPage}))
        ),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // '/admin/reset-password' is intentionally absent: it is registered as a top-level
    // route in router.tsx, outside AdminGuard. AdminGuard redirects to it when an account
    // must change its password, so a route inside the guarded subtree would loop.
    {
        key: 'admin.products.new',
        path: '/admin/products/new',
        component: lazy(() =>
            import('@/admin/pages/products/ProductCreatePage').then((m) => ({
                default: m.ProductCreatePage,
            }))
        ),
        authority: rolesFor('product:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.edit',
        path: '/admin/products/:productId/edit',
        component: lazy(() =>
            import('@/admin/pages/products/ProductEditPage').then((m) => ({
                default: m.ProductEditPage,
            }))
        ),
        authority: rolesFor('product:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.brands.new',
        path: '/admin/products/brands/new',
        component: lazy(() =>
            import('@/admin/pages/brands/BrandCreatePage').then((m) => ({
                default: m.BrandCreatePage,
            }))
        ),
        authority: rolesFor('brand:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.brands.edit',
        path: '/admin/products/brands/:brandId/edit',
        component: lazy(() =>
            import('@/admin/pages/brands/BrandEditPage').then((m) => ({
                default: m.BrandEditPage,
            }))
        ),
        authority: rolesFor('brand:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.categories.new',
        path: '/admin/products/categories/new',
        component: lazy(() =>
            import('@/admin/pages/categories/CategoryCreatePage').then((m) => ({
                default: m.CategoryCreatePage,
            }))
        ),
        authority: rolesFor('category:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.categories.edit',
        path: '/admin/products/categories/:categoryId/edit',
        component: lazy(() =>
            import('@/admin/pages/categories/CategoryEditPage').then((m) => ({
                default: m.CategoryEditPage,
            }))
        ),
        authority: rolesFor('category:write'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.orders.detail',
        path: '/admin/orders/:orderId',
        component: lazy(() =>
            import('@/admin/pages/orders/OrderDetailPage').then((m) => ({
                default: m.OrderDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.customers.detail',
        path: '/admin/customers/:customerId',
        component: lazy(() =>
            import('@/admin/pages/customers/retail/CustomerDetailPage').then((m) => ({
                default: m.CustomerDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.wholesale.customers.detail',
        path: '/admin/wholesale/customers/:customerId',
        component: lazy(() =>
            import('@/admin/pages/customers/wholesale/WholesaleCustomerDetailPage').then((m) => ({
                default: m.WholesaleCustomerDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.wholesale.applications.detail',
        path: '/admin/wholesale/applications/:applicationId',
        component: lazy(() =>
            import('@/admin/pages/customers/wholesale/WholesaleApplicationDetailPage').then((m) => ({
                default: m.WholesaleApplicationDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.quotes.detail',
        path: '/admin/quotes/:quoteRequestId',
        component: lazy(() =>
            import('@/admin/pages/quotes/QuoteRequestDetailPage').then((m) => ({
                default: m.QuoteRequestDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.products.upload',
        path: '/admin/imports/products/bulk-upload',
        component: lazy(() => import('@/admin/pages/imports/ProductImportUploadPage')),
        authority: rolesFor('import:manage'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.products.review',
        path: '/admin/imports/products/bulk-upload/review/:batchId',
        component: lazy(() => import('@/admin/pages/imports/ProductImportReviewPage')),
        authority: rolesFor('import:manage'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.price.upload',
        path: '/admin/imports/products/price/bulk-upload',
        component: lazy(() => import('@/admin/pages/imports/PriceImportUploadPage')),
        authority: rolesFor('import:manage'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.price.review',
        path: '/admin/imports/products/price/bulk-upload/review/:batchId',
        component: lazy(() => import('@/admin/pages/imports/PriceImportReviewPage')),
        authority: rolesFor('import:manage'),
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.storefront.legal.edit',
        path: '/admin/storefront/legal/:id',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/LegalPageEditPage').then((m) => ({
                default: m.LegalPageEditPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Edit Legal Page',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    // '/admin/staff/new' and '/admin/staff/:id/edit' are intentionally absent: staff
    // create/edit now happens in StaffFormDialog on '/admin/staff' itself, mirroring
    // ShippingMethodsPage's dialog-based CRUD rather than routed create/edit pages.
]

export const adminRoutingRoutes: AdminRouteList = [
    ...adminPageOnlyRoutes,
    ...toAdminPageRoutes(adminMenuRoutes),
]
