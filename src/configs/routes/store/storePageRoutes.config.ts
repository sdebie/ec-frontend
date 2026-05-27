import {lazy} from 'react'

import {toPageRoutes} from '../routeHelpers'

import {storeMenuRoutes} from './storeMenuRoutes.config'

import type {PageRoutes} from '@/types/routes'

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
        component: lazy(() => import('@/tenants/default/pages/productdetail/page.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'checkout',
        path: '/checkout',
        component: lazy(() => import('@/tenants/default/pages/checkout/screens/Checkout.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'createAccount',
        path: '/create-account',
        component: lazy(() => import('@/tenants/default/pages/createaccount/CreateAccount.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'resetPassword',
        path: '/reset-password',
        component: lazy(() => import('@/tenants/default/pages/resetpassword/ResetPassword.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'paymentSuccess',
        path: '/payment-success',
        component: lazy(() => import('@/features/checkout/PaymentSuccess.tsx')),
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
