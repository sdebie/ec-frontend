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
        component: lazy(() => import('@/tenants/default/pages/home/StorefrontHomePage.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'products',
        path: '/products',
        component: lazy(() => import('@/tenants/default/pages/products/ProductList.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'cart',
        path: '/cart',
        component: lazy(() => import('@/tenants/default/pages/shoppingCart/screens/ShoppingCart.tsx')),
        authority: [],
        meta: shopMeta,
    },
    {
        key: 'contactUs',
        path: '/contact-us',
        component: lazy(() => import('@/tenants/default/pages/contactUs/ContactUs.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'aboutUs',
        path: '/about-us',
        component: lazy(() => import('@/tenants/default/pages/aboutus/screens')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'wholesaleApplication',
        path: '/wholesale-application',
        component: lazy(() => import('@/tenants/default/pages/wholesaleApplication/WholesaleApplication.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'termsAndConditions',
        path: '/terms-and-conditions',
        component: lazy(() => import('@/tenants/default/pages/termsandconditions/TermsAndConditions.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'privacyPolicy',
        path: '/privacy-policy',
        component: lazy(() => import('@/tenants/default/pages/privacypolicy/PrivacyPolicy.tsx')),
        authority: [],
        meta: defaultMeta,
    },
    {
        key: 'deliveryAndReturnsPolicy',
        path: '/delivery-and-returns-policy',
        component: lazy(() => import('@/tenants/default/pages/deliveryandreturnspolicy/DeliveryAndReturnsPolicy.tsx')),
        authority: [],
        meta: defaultMeta,
    },
]
