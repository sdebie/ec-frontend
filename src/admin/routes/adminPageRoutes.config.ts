import {lazy} from 'react'
import {toAdminPageRoutes} from '@/app/router/buildAdminRoutes'
import {adminMenuRoutes} from './adminMenuRoutes.config'
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
    {
        key: 'admin.reset-password',
        path: '/admin/reset-password',
        component: lazy(() =>
            import('@/admin/pages/AdminResetPasswordPage').then((m) => ({default: m.AdminResetPasswordPage}))
        ),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.products.new',
        path: '/admin/products/new',
        component: lazy(() =>
            import('@/admin/pages/products/ProductCreatePage').then((m) => ({
                default: m.ProductCreatePage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER'],
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
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER'],
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
        authority: ['SUPER_ADMIN'],
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
        authority: ['SUPER_ADMIN'],
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
        authority: ['SUPER_ADMIN'],
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
        authority: ['SUPER_ADMIN'],
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
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.customers.detail',
        path: '/admin/customers/:customerId',
        component: lazy(() =>
            import('@/admin/pages/customers/CustomerDetailPage').then((m) => ({
                default: m.CustomerDetailPage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.wholesale.customers.detail',
        path: '/admin/wholesale/customers/:customerId',
        component: lazy(() =>
            import('@/admin/pages/wholesale/WholesaleCustomerDetailPage').then((m) => ({
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
            import('@/admin/pages/wholesale/WholesaleApplicationDetailPage').then((m) => ({
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
        key: 'admin.imports.products.upload',
        path: '/admin/imports/products/bulk-upload',
        component: lazy(() => import('@/admin/pages/imports/ProductImportUploadPage')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.products.review',
        path: '/admin/imports/products/bulk-upload/review/:batchId',
        component: lazy(() => import('@/admin/pages/imports/ProductImportReviewPage')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.price.upload',
        path: '/admin/imports/products/price/bulk-upload',
        component: lazy(() => import('@/admin/pages/imports/PriceImportUploadPage')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.price.review',
        path: '/admin/imports/products/price/bulk-upload/review/:batchId',
        component: lazy(() => import('@/admin/pages/imports/PriceImportReviewPage')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
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
    {
        key: 'admin.staff.new',
        path: '/admin/staff/new',
        component: lazy(() =>
            import('@/admin/pages/staff/StaffCreatePage').then((m) => ({
                default: m.StaffCreatePage,
            }))
        ),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.staff.edit',
        path: '/admin/staff/:id/edit',
        component: lazy(() =>
            import('@/admin/pages/staff/StaffEditPage').then((m) => ({
                default: m.StaffEditPage,
            }))
        ),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export const adminRoutingRoutes: AdminRouteList = [
    ...adminPageOnlyRoutes,
    ...toAdminPageRoutes(adminMenuRoutes),
]
