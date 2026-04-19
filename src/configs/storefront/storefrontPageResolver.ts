import {storefrontPageRegistry, storefrontPageVariantRegistry} from '@/configs/storefront/storefrontPageRegistry.ts';
import type {
    StorefrontPageResolverInput,
    StorefrontPageResolverResult,
} from '@/types/storefront/storefrontPageContracts.ts';

export const resolveStorefrontPage = ({
                                          routeKey,
                                          routeComponent,
                                          storefrontConfig,
                                      }: StorefrontPageResolverInput): StorefrontPageResolverResult => {


    const defaultComponent = storefrontPageRegistry[routeKey];
    const requestedVariant = storefrontConfig.pages?.variants?.[routeKey];

    if (requestedVariant) {
        const variantComponent = storefrontPageVariantRegistry[routeKey]?.[requestedVariant];

        if (variantComponent) {
            return {
                component: variantComponent,
                pageKey: routeKey,
                resolvedVariant: requestedVariant,
                fallbackApplied: false,
            };
        }

        if (defaultComponent) {
            return {
                component: defaultComponent,
                pageKey: routeKey,
                resolvedVariant: 'default',
                fallbackApplied: true,
                fallbackReason: 'invalid-resolution',
            };
        }
    }

    if (defaultComponent) {
        return {
            component: defaultComponent,
            pageKey: routeKey,
            resolvedVariant: 'default',
            fallbackApplied: false,
        };
    }

    return {
        component: routeComponent,
        pageKey: routeKey,
        resolvedVariant: 'default',
        fallbackApplied: true,
        fallbackReason: 'missing-registry-entry',
    };
};