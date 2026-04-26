// ec-frontend/src/configs/storefront/storefrontPageValidation.ts
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageContracts.ts';
import {CANONICAL_STOREFRONT_PAGE_KEYS} from '@/types/storefront/storefrontPageKeys.ts';
import {
    storefrontPageRegistry,
    storefrontPageVariantRegistry,
} from '@/configs/storefront/storefrontPageRegistry.ts';
import {getStorefrontRegistry} from '@/configs/storefront/storefrontRegistry.ts';
import {storeMenuRoutes} from '@/configs/routes/store/storeMenuRoutes.config.ts';
import {storeRoutingRoutes} from '@/configs/routes/store/storePageRoutes.config.ts';

const normalizePath = (value: string): string => {
    const [withoutQuery] = value.split('?');
    const [withoutHash] = withoutQuery.split('#');
    const normalized = withoutHash.trim();
    if (normalized === '/') return '/';
    return normalized.replace(/\/+$/, '');
};

const isExternalLink = (to: string, external?: boolean): boolean => {
    if (external) return true;
    // Covers http(s), mailto, tel, etc.
    if (/^[a-z][a-z0-9+.-]*:/i.test(to)) return true;
    return to.startsWith('//');
};

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

    // Canonical page keys from the single source of truth.
    const canonicalPageKeys: readonly StorefrontPageKey[] =
        CANONICAL_STOREFRONT_PAGE_KEYS;

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

    // Collect known store route paths for nav-path validation.
    const knownStorePaths = new Set(
        storeRoutingRoutes.map((route) => normalizePath(route.path)),
    );

    // Validate client-level variant and navigation drift. Warnings only.
    const storefrontClients = Object.values(getStorefrontRegistry());
    storefrontClients.forEach((clientConfig) => {
        const clientId = clientConfig.id;
        const variants = clientConfig.pages?.variants ?? {};

        Object.entries(variants).forEach(([rawPageKey, variantId]) => {
            const pageKey = rawPageKey as StorefrontPageKey;

            if (!canonicalPageKeys.includes(pageKey)) {
                warnings.push(
                    `[StorefrontPageValidation] Client "${clientId}" references unknown page variant key "${rawPageKey}".`,
                );
                return;
            }

            const variantsForPage = storefrontPageVariantRegistry[pageKey];
            const variantExists = !!variantsForPage?.[variantId as string];
            if (!variantExists) {
                warnings.push(
                    `[StorefrontPageValidation] Client "${clientId}" references unknown variant id "${variantId}" for page "${pageKey}".`,
                );
            }
        });

        const menuItems = clientConfig.navigation?.menuItems ?? [];
        const seenNavIds = new Set<string>();

        menuItems.forEach((item) => {
            if (seenNavIds.has(item.id)) {
                warnings.push(
                    `[StorefrontPageValidation] Client "${clientId}" has duplicate navigation item id "${item.id}".`,
                );
            } else {
                seenNavIds.add(item.id);
            }

            if (isExternalLink(item.to, item.external)) {
                return;
            }

            const normalizedNavPath = normalizePath(item.to);
            if (!knownStorePaths.has(normalizedNavPath)) {
                warnings.push(
                    `[StorefrontPageValidation] Client "${clientId}" navigation item "${item.id}" points to unknown internal path "${item.to}".`,
                );
            }
        });
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
