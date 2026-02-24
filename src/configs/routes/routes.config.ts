import {Routes} from "../../@types/routes";
import {lazy} from "react";

export const appRoutes: Routes = [
    {
        key: 'home',
        path: `/`,
        component: lazy(() => import('../../pages/products/Products')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'products',
        path: `/products`,
        component: lazy(() => import('../../pages/products/Products')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'cart',
        path: `/cart`,
        component: lazy(() => import('../../pages/cart/Cart')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'checkout',
        path: `/checkout`,
        component: lazy(() => import('../../pages/cart/Checkout')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'paymentSuccess',
        path: `/payment-success`,
        component: lazy(() => import('../../pages/cart/Success')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(() => import('../../pages/other/AccessDenied')),
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]