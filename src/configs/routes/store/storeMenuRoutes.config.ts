import {lazy} from 'react'
import type {Routes} from '@/types/routes.ts'


/**
 * Menu routes for store
 * Only routes with hideInMenu: false are displayed in the navigation menu
 */
export const storeMenuRoutes: Routes = [
    {
        key: 'home',
        path: `/`,
        component: lazy(() => import('../../../pages/shop/default/home/StorefrontHomePage.tsx')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'products',
        path: `/products`,
        component: lazy(() => import('../../../pages/shop/default/products/ProductList.tsx')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'cart',
        path: `/cart`,
        component: lazy(() => import('@/pages/storefront/shoppingCart/screens/ShoppingCart.tsx')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

