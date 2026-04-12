import { lazy } from 'react'
import type { PageRoutes } from '@/types/routes'
import { toPageRoutes } from '../routeHelpers'
import { adminMenuRoutes } from './adminMenuRoutes.config'

/**
 * Admin page routes only contain routing metadata.
 * Menu-specific fields such as label, icon, section and hideInMenu stay in adminMenuRoutes.
 */
const adminPageOnlyRoutes: PageRoutes = [
    {
        key: 'admin.login',
        path: '/admin/login',
        component: lazy(() => import('../../../pages/admin/AdminLogin.tsx')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.reset-password',
        path: '/admin/reset-password',
        component: lazy(() => import('../../../pages/admin/AdminResetPassword.tsx')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.product.detail',
        path: '/admin/product/detail/:id',
        component: lazy(() => import('@/pages/admin/products/screens/detail/ProductDetail')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.bulk.images',
        path: '/admin/imports/images/bulk-upload/',
        component: lazy(() => import('@/pages/admin/images/BulkImageUploader.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.bulk.products',
        path: '/admin/imports/products/bulk-upload',
        component: lazy(() => import('@/pages/admin/products/screens/upload/products/ProductBulkUpload.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.bulk.products.review',
        path: '/admin/imports/products/bulk-upload/review/:batchId',
        component: lazy(() => import('@/pages/admin/products/screens/upload/products/ProductImportReview.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.bulk.products.price',
        path: '/admin/imports/products/price/bulk-upload',
        component: lazy(() => import('@/pages/admin/products/screens/upload/prices/ProductPriceBulkUpload.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'admin.imports.bulk.products.price.review',
        path: '/admin/imports/products/price/bulk-upload/review/:batchId',
        component: lazy(() => import('@/pages/admin/products/screens/upload/prices/ProductPriceImportReview.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export const adminRoutingRoutes: PageRoutes = [
    ...adminPageOnlyRoutes,
    ...toPageRoutes(adminMenuRoutes),
]
