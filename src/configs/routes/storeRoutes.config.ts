import {Routes} from "../../@types/routes";
import {lazy} from "react";

export const storeRoutes: Routes = [
    {
        key: 'home',
        path: `/`,
        component: lazy(() => import('@/pages/shop/products/Products')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'products',
        path: `/products`,
        component: lazy(() => import('@/pages/shop/products/Products')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
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
        key: 'cart',
        path: `/cart`,
        component: lazy(() => import('@/pages/shop/cart/Cart')),
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
        component: lazy(() => import('@/pages/shared/other/AccessDenied')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]