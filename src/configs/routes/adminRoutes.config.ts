import {Routes} from "../../@types/routes";
import {lazy} from "react";

export const adminRoutes: Routes = [
    {
        key: 'admin.dashboard',
        path: `/admin`,
        component: lazy(() => import('../../admin/Dashboard.tsx')),
        authority: ['admin'],
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
        component: lazy(() => import('../../admin/components/ToDoView.tsx')),
        authority: ['admin'],
        meta: {
            label: 'Products',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
    },
    {
        key: 'admin.orders',
        path: `/admin/orders`,
        component: lazy(() => import('../../admin/components/ToDoView.tsx')), // Placeholder
        authority: ['admin'],
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
        component: lazy(() => import('../../admin/components/ToDoView.tsx')), // Placeholder
        authority: ['admin'],
        meta: {
            label: 'Customers',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'users',
        },
    }
]
