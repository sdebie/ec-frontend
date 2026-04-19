// ec-frontend/src/configs/storefront/storefrontPageRegistry.ts
/**
 * Central storefront page registry.
 *
 * IMPORTANT:
 * Keep this mapping aligned 1:1 with the current storefront route bindings in:
 * - src/configs/routes/store/storeMenuRoutes.config.ts
 * - src/configs/routes/store/storePageRoutes.config.ts
 */
import {lazy} from 'react';
import type {StorefrontPageComponent, StorefrontPageKey} from '@/types/storefront/storefrontPageContracts.ts';

export const storefrontPageRegistry: Record<StorefrontPageKey, StorefrontPageComponent> = {
    home: lazy(() => import('@/pages/shop/default/home/StorefrontHomePage.tsx')),
    products: lazy(() => import('@/pages/shop/default/products/ProductList.tsx')),
    cart: lazy(() => import('@/pages/storefront/default/shoppingCart/screens/ShoppingCart.tsx')),
    productDetail: lazy(() => import('@/pages/shop/default/products/ProductDetailsPage.tsx')),
    checkout: lazy(() => import('@/pages/storefront/default/checkout/screens/Checkout.tsx')),
    paymentSuccess: lazy(() => import('@/pages/shop/default/cart/Success.tsx')),
    accessDenied: lazy(() => import('@/pages/shared/AccessDenied')),
    contactUs: lazy(() => import('@/pages/storefront/default/contactUs/ContactUs.tsx')),
    aboutUs: lazy(() => import('@/pages/storefront/default/aboutus/screens')),
};

type StorefrontPageVariantRegistry = Partial<
    Record<StorefrontPageKey, Record<string, StorefrontPageComponent>>
>;

export const storefrontPageVariantRegistry: StorefrontPageVariantRegistry = {
    home: {
        'uvh-home': lazy(() => import('@/pages/storefront/uvh/home/UvhHomePage.tsx')),
    },
    products: {
        'uvh-products': lazy(() => import('@/pages/storefront/uvh/products/UvhProductCatalogue.tsx')),
    },
    contactUs: {
        'uvh-contact-us': lazy(() => import('@/pages/storefront/uvh/contactus/UvhContactUs.tsx')),
    },
    aboutUs: {
        'uvh-about-us': lazy(() => import('@/pages/storefront/uvh/aboutus/UvhAboutUs.tsx')),
    }
}
