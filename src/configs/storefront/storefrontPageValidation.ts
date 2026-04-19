// ec-frontend/src/configs/storefront/storefrontPageValidation.ts
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageContracts.ts';
import {storefrontPageRegistry} from '@/configs/storefront/storefrontPageRegistry.ts';
import {storeMenuRoutes} from '@/configs/routes/store/storeMenuRoutes.config.ts';
import {storeRoutingRoutes} from '@/configs/routes/store/storePageRoutes.config.ts';

/**
 * Phase 1 validation for storefront page resolver infrastructure.
 * Ensures canonical page keys are aligned with route definitions and registry coverage.
 * Non-blocking: validation failures log warnings but do not prevent runtime.
 */
export const validateStorefrontPageInfrastructure = (): { valid: boolean; warnings: string[] } => {
    const warnings: string[] = [];

    // Collect all route keys from store route definitions
    const routeKeysFromMenuRoutes = storeMenuRoutes.map((route) => route.key);
    const routeKeysFromPageRoutes = storeRoutingRoutes.map((route) => route.key);
    const allRouteKeys = new Set([...routeKeysFromMenuRoutes, ...routeKeysFromPageRoutes]);

    // All canonical page keys
    const canonicalPageKeys: StorefrontPageKey[] = [
        'home',
        'products',
        'cart',
        'productDetail',
        'checkout',
        'paymentSuccess',
        'accessDenied',
        'contactUs',
    ];

    // Validate: all canonical page keys must have registry entries
    canonicalPageKeys.forEach((pageKey) => {
        if (!storefrontPageRegistry[pageKey]) {
            warnings.push(
                `[StorefrontPageValidation] Canonical page key "${pageKey}" is missing from storefrontPageRegistry.`
            );
        }
    });

    // Validate: all canonical page keys should have corresponding route keys
    canonicalPageKeys.forEach((pageKey) => {
        if (!allRouteKeys.has(pageKey)) {
            warnings.push(
                `[StorefrontPageValidation] Canonical page key "${pageKey}" has no matching route key in store route definitions.`
            );
        }
    });

    // Validate: all route keys should ideally have canonical page key equivalents
    // (Warning only; route keys may exist that are not in canonical set)
    allRouteKeys.forEach((routeKey) => {
        if (!canonicalPageKeys.includes(routeKey as StorefrontPageKey)) {
            warnings.push(
                `[StorefrontPageValidation] Route key "${routeKey}" is not in canonical StorefrontPageKey union. Consider adding it if intentional.`
            );
        }
    });

    if (warnings.length > 0) {
        if (typeof console !== 'undefined' && console.warn) {
            warnings.forEach((warning) => console.warn(warning));
        }
    }

    return {
        valid: warnings.length === 0,
        warnings,
    };
};
