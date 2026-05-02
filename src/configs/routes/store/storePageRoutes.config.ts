import {lazy} from 'react'
import type {PageRoutes} from '@/types/routes'
import {toPageRoutes} from '../routeHelpers'
import {storeMenuRoutes} from './storeMenuRoutes.config'

const defaultMeta = {
    pageBackgroundType: 'plain',
    pageContainerType: 'contained',
} as const

const shopMeta = {
    ...defaultMeta,
    layout: 'shop',
} as const

/**
 * Storefront page routes that should not appear in menus.
 */
const storePageOnlyRoutes: PageRoutes = [
    {
        key: 'productDetail',
        path: '/product/:productId',
        component: lazy(() => import('@/pages/storefront/default/products/ProductDetailsPage.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'checkout',
        path: '/checkout',
        component: lazy(() => import('@/pages/storefront/default/checkout/screens/Checkout.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'paymentSuccess',
        path: '/payment-success',
        component: lazy(() => import('@/pages/storefront/default/payment/Success.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(() => import('@/pages/shared/AccessDenied')),
        authority: [],
        meta: defaultMeta,
    },
]

export const storeRoutingRoutes: PageRoutes = [
    ...toPageRoutes(storeMenuRoutes),
    ...storePageOnlyRoutes,
]
