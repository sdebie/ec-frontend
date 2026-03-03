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
        component: lazy(() => import('../../pages/admin/ToDoView.tsx')),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Products',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
        subMenu: [
            {
                key: 'admin.products.list',
                path: `/admin/products/list`,
                component: lazy(() => import('../../pages/admin/ToDoView.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Product List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.create',
                path: `/admin/products/create`,
                component: lazy(() => import('../../pages/admin/ToDoView.tsx')),
                authority: ['SUPER_ADMIN'],
                meta: {
                    label: 'Create Product',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            }
        ]
    },
    {
        key: 'admin.orders',
        path: `/admin/orders`,
        component: lazy(() => import('../../pages/admin/ToDoView.tsx')), // Placeholder
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
        component: lazy(() => import('../../pages/admin/ToDoView.tsx')), // Placeholder
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Customers',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'users',
        },
    }
]
