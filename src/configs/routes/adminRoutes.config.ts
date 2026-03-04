import {Routes} from "../../@types/routes";
import {lazy} from "react";

export const adminRoutes: Routes = [
    {
        key: 'admin.login',
        path: `/admin/login`,
        component: lazy(() => import('../../pages/admin/AdminLogin.tsx')),
        authority: [],
        meta: {
            label: 'Logon',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'layout-dashboard',
        },
    },
    {
        key: 'admin.dashboard',
        path: `/admin`,
        component: lazy(() => import('../../pages/admin/Dashboard.tsx')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Dashboard',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'layout-dashboard',
        },
    },
    {
        key: 'admin.products',
        path: `/admin/products`,
        component: lazy(() => import('../../pages/shared/ToDoView.tsx')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Products',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
        subMenu: [
            {
                key: 'admin.products.brands',
                path: `/admin/products/brands`,
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
                path: `/admin/products/categories`,
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
                path: `/admin/products/list`,
                component: lazy(() => import('../../pages/admin/products/ProductList.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Product List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ]
    },
    {
        key: 'admin.orders',
        path: `/admin/orders`,
        component: lazy(() => import('../../pages/shared/ToDoView.tsx')), // Placeholder
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Orders',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'shopping-bag',
        },
    },
    {
        key: 'admin.customers',
        path: `/admin/customers`,
        component: lazy(() => import('../../pages/shared/ToDoView.tsx')), // Placeholder
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Customers',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'users',
        },
    }
]
