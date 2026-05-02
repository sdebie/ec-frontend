import {lazy} from 'react'
import type {Routes} from '@/types/routes'

const defaultMeta = {
    pageBackgroundType: 'plain',
    pageContainerType: 'contained',
} as const

const shopMeta = {
    ...defaultMeta,
    layout: 'shop',
} as const

/**
 * Storefront routes shown in navigation menus.
 */
export const storeMenuRoutes: Routes = [
    {
        key: 'home',
        path: '/',
        component: lazy(() => import('@/pages/storefront/core/default/home/StorefrontHomePage.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'products',
        path: '/products',
        component: lazy(() => import('@/pages/storefront/core/default/products/ProductList.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'cart',
        path: '/cart',
        component: lazy(() => import('@/pages/storefront/default/shoppingCart/screens/ShoppingCart.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'contactUs',
        path: '/contact-us',
        component: lazy(() => import('@/pages/storefront/default/contactUs/ContactUs.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'aboutUs',
        path: '/about-us',
        component: lazy(() => import('@/pages/storefront/default/aboutus/screens')),
        authority: [],
        meta: defaultMeta,
    },
]
