import { lazy } from 'react'
import type { Routes } from '../../@types/routes'

export const adminRoutes: Routes = [
    {
        key: 'admin.login',
        path: '/admin/login',
        component: lazy(() => import('../../pages/admin/AdminLogin.tsx')),
        authority: [],
        meta: {
            label: 'Logon',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            hideInMenu: true,
        },
    },
    {
        key: 'admin.dashboard',
        path: '/admin',
        component: lazy(() => import('../../pages/admin/Dashboard.tsx')),
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
        component: lazy(() => import('../../pages/shared/ToDoView.tsx')),
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
                component: lazy(() => import('../../pages/admin/brands/BrandList.tsx')),
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
                component: lazy(() => import('../../pages/admin/categories/CategoryList.tsx')),
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
                component: lazy(() => import('../../pages/admin/products/ProductList.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Product List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.settings',
        path: '/admin/settings',
        component: lazy(() => import('../../pages/admin/Settings.tsx')),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Settings',
            section: 'CONFIGURATION',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'settings',
        },
    },
    {
        key: 'admin.component-demo',
        path: '/admin/component-demo',
        component: lazy(() => import('../../pages/shared/demo/ComponentsDemo.tsx')),
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