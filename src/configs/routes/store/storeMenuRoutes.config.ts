import { lazy } from 'react'
import type { Routes } from '../../../@types/routes'

/**
 * Menu routes for store
 * Only routes with hideInMenu: false are displayed in the navigation menu
 */
export const storeMenuRoutes: Routes = [
    {
        key: 'home',
        path: `/`,
        component: lazy(() => import('@/pages/shop/products/ProductList')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'products',
        path: `/products`,
        component: lazy(() => import('@/pages/shop/products/ProductList')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'cart',
        path: `/cart`,
        component: lazy(() => import('@/pages/shop/cart/Cart')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

