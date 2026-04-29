import {lazy} from 'react'
import type {LazyExoticComponent, ComponentType} from 'react'
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys'
import type {PageMeta, PageRoute, Route, RouteMeta} from '@/types/routes'

type StorefrontRouteComponent = LazyExoticComponent<ComponentType<any>>

export interface StorefrontRouteContract {
    key: StorefrontPageKey
    path: string
    component: StorefrontRouteComponent
    menu: boolean
    meta: PageMeta
}

const defaultMeta: PageMeta = {
    pageBackgroundType: 'plain',
    pageContainerType: 'contained',
}

const shopMeta: PageMeta = {
    ...defaultMeta,
    layout: 'shop',
}

const storefrontRouteContracts: ReadonlyArray<StorefrontRouteContract> = [
    {
        key: 'home',
        path: '/',
        component: lazy(() => import('@/pages/storefront/default/home/StorefrontHomePage.tsx')),
        menu: true,
        meta: defaultMeta,
    },
    {
        key: 'products',
        path: '/products',
        component: lazy(() => import('@/pages/storefront/default/products/ProductList.tsx')),
        menu: true,
        meta: shopMeta,
    },
    {
        key: 'cart',
        path: '/cart',
        component: lazy(() => import('@/pages/storefront/default/shoppingCart/screens/ShoppingCart.tsx')),
        menu: true,
        meta: shopMeta,
    },
    {
        key: 'contactUs',
        path: '/contact-us',
        component: lazy(() => import('@/pages/storefront/default/contactUs/ContactUs.tsx')),
        menu: true,
        meta: defaultMeta,
    },
    {
        key: 'aboutUs',
        path: '/about-us',
        component: lazy(() => import('@/pages/storefront/default/aboutus/screens')),
        menu: true,
        meta: defaultMeta,
    },
    {
        key: 'productDetail',
        path: '/product/:productId',
        component: lazy(() => import('@/pages/storefront/default/products/ProductDetailsPage.tsx')),
        menu: false,
        meta: shopMeta,
    },
    {
        key: 'checkout',
        path: '/checkout',
        component: lazy(() => import('@/pages/storefront/default/checkout/screens/Checkout.tsx')),
        menu: false,
        meta: shopMeta,
    },
    {
        key: 'paymentSuccess',
        path: '/payment-success',
        component: lazy(() => import('@/pages/storefront/default/payment/Success.tsx')),
        menu: false,
        meta: defaultMeta,
    },
    {
        key: 'accessDenied',
        path: '/access-denied',
        component: lazy(() => import('@/pages/shared/AccessDenied')),
        menu: false,
        meta: defaultMeta,
    },
]

function toRoute(contract: StorefrontRouteContract): Route {
    return {
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }
}

function toPageRoute(contract: StorefrontRouteContract): PageRoute {
    return {
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }
}

export function listStorefrontRouteContracts(): StorefrontRouteContract[] {
    return storefrontRouteContracts.map((contract) => ({...contract}))
}

export function listStorefrontMenuRoutes(): Route[] {
    return storefrontRouteContracts.filter((route) => route.menu).map(toRoute)
}

export function listStorefrontPageRoutes(): PageRoute[] {
    return storefrontRouteContracts.map(toPageRoute)
}

