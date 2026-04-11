import {lazy} from 'react'
import type {Routes} from '@/types/routes'

/**
 * Menu routes for admin panel
 * Only routes with hideInMenu: false are displayed in the sidebar menu
 */
export const adminMenuRoutes: Routes = [
    {
        key: 'admin.dashboard',
        path: '/admin',
        component: lazy(() => import('../../../pages/admin/dashboard/Dashboard.tsx')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Dashboard',
            section: 'MAIN',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'layout-dashboard',
            menuMatch: 'exact',
        },
    },
    {
        key: 'admin.products',
        path: '/admin/products',
        component: lazy(() => import('../../../pages/shared/ToDoView.tsx')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Products',
            section: 'PRODUCT MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
        subMenu: [
            {
                key: 'admin.products.brands',
                path: '/admin/products/brands',
                component: lazy(() => import('@/pages/admin/brands/screens/list')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Brands',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.categories',
                path: '/admin/products/categories',
                component: lazy(() => import('@/pages/admin/category/screens/list')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Categories',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.list',
                path: '/admin/products/list',
                component: lazy(() => import('@/pages/admin/products/screens/list/ProductList')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Product List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.productssales.list',
                path: '/admin/productssales/list',
                component: lazy(() => import('@/pages/admin/products/screens/list/ProductSaleList')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Product on Sale List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.imports',
        path: '/admin/imports',
        component: lazy(() => import('../../../pages/shared/ToDoView.tsx')),
        authority: [],
        meta: {
            label: 'Imports',
            section: 'PRODUCT MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
        subMenu: [
            {
                key: 'admin.imports.images',
                path: '/admin/imports/images/',
                component: lazy(() => import('@/pages/admin/images/ProductGallery.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Image Gallery',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.imports.products.list',
                path: '/admin/imports/products/list',
                component: lazy(() => import('@/pages/admin/products/screens/upload/products/BulkProductUploadList.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Bulk Product Upload',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.imports.products.price',
                path: '/admin/imports/products/price',
                component: lazy(() => import('@/pages/admin/products/screens/upload/prices/BulkProductPriceUploadList.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Bulk Product Price Changes',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.settings',
        path: '/admin/settings',
        component: lazy(() => import('../../../pages/admin/settings/screens/./GeneralSettings')),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Settings',
            section: 'CONFIGURATION',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'settings',
        },
        subMenu: [
            {
                key: 'admin.settings.general',
                path: '/admin/settings/general',
                component: lazy(() => import('../../../pages/admin/settings/screens/./GeneralSettings')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'General Settings',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.settings.store',
                path: '/admin/settings/store',
                component: lazy(() => import('../../../pages/admin/settings/screens/./StoreSettings')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Store Settings',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.settings.shipping',
                path: '/admin/settings/shipping',
                component: lazy(() => import('../../../pages/admin/settings/screens/./ShippingSettings')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Shipping Methods',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.staff',
        path: '/admin/staff',
        component: lazy(() => import('@/pages/admin/staff/screens/list/./StaffList.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Staff',
            section: 'CONFIGURATION',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'settings',
        },
        subMenu: [
            {
                key: 'admin.staff.list',
                path: '/admin/staff/list',
                component: lazy(() => import('@/pages/admin/staff/screens/list/./StaffList.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Staff List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ]
    },
    {
        key: 'admin.component-demo',
        path: '/admin/component-demo',
        component: lazy(() => import('../../../pages/shared/demo/ComponentsDemo.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Component Demo',
            section: 'CONFIGURATION',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'component',
        },
    },
]

