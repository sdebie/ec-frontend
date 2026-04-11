import { lazy } from 'react'
import type { PageRoutes } from '../../../types/routes'
import { toPageRoutes } from '../routeHelpers'
import { storeMenuRoutes } from './storeMenuRoutes.config'

const storeFront = import.meta.env.VITE_STORE_FRONT || 'default';

/**
 * Store page routes only contain routing metadata.
 * Menu-specific fields such as hideInMenu stay out of page routing.
 */
const storePageOnlyRoutes: PageRoutes = [
    {
        key: 'productDetail',
        path: `/product/:productId`,
        component: lazy(() => import(`../../pages/shop/${storeFront}/products/ProductDetailsPage.tsx`)),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'checkout',
        path: `/checkout`,
        component: lazy(() => import(`../../pages/shop/${storeFront}/cart/Checkout.tsx`)),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'paymentSuccess',
        path: `/payment-success`,
        component: lazy(() => import(`../../pages/shop/${storeFront}/cart/Success.tsx`)),
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
