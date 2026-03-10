import { lazy } from 'react'
import type { PageRoutes } from '../../../@types/routes'
import { toPageRoutes } from '../routeHelpers'
import { storeMenuRoutes } from './storeMenuRoutes.config'

/**
 * Store page routes only contain routing metadata.
 * Menu-specific fields such as hideInMenu stay out of page routing.
 */
const storePageOnlyRoutes: PageRoutes = [
    {
        key: 'productDetail',
        path: `/product/:productId`,
        component: lazy(() => import('@/pages/shop/products/ProductDetailsPage')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'checkout',
        path: `/checkout`,
        component: lazy(() => import('@/pages/shop/cart/Checkout')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'paymentSuccess',
        path: `/payment-success`,
        component: lazy(() => import('@/pages/shop/cart/Success')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(() => import('@/pages/shared/AccessDenied')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export const storeRoutingRoutes: PageRoutes = [
    ...toPageRoutes(storeMenuRoutes),
    ...storePageOnlyRoutes,
]
