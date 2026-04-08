import { lazy } from 'react'
import type { Routes } from '../../../@types/routes'

const storeFront = import.meta.env.VITE_STORE_FRONT || 'default';

/**
 * Menu routes for store
 * Only routes with hideInMenu: false are displayed in the navigation menu
 */
export const storeMenuRoutes: Routes = [
    {
        key: 'home',
        path: `/`,
        component: lazy(() => import(`../../../pages/shop/${storeFront}/home/HomePage.tsx`)),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'products',
        path: `/products`,
        component: lazy(() => import(`../../../pages/shop/${storeFront}/products/ShopPage.tsx`)),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'cart',
        path: `/cart`,
        component: lazy(() => import('@/pages/shop/default/cart/Cart')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

