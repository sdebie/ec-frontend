/**
 * Canonical storefront page keys.
 * Keep aligned with existing storefront route keys.
 */
export const CANONICAL_STOREFRONT_PAGE_KEYS = [
    'home',
    'products',
    'cart',
    'productDetail',
    'checkout',
    'createAccount',
    'paymentSuccess',
    'accessDenied',
    'contactUs',
    'aboutUs',
    'wholesaleApplication',
    'termsAndConditions',
    'privacyPolicy',
    'deliveryAndReturnsPolicy',
] as const;

export type StorefrontPageKey = (typeof CANONICAL_STOREFRONT_PAGE_KEYS)[number];
