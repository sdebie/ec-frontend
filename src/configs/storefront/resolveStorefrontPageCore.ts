
import {resolveStorefrontConventionPage} from '@/configs/storefront/storefrontPageConventionRegistry'
import {storefrontPageRegistry, storefrontPageVariantRegistry} from '@/configs/storefront/storefrontPageRegistry'

import type {
    StorefrontPageComponent,
    StorefrontPageResolverInput,
    StorefrontPageResolverResult,
} from '@/types/storefront/storefrontPageContracts'

/**
 * Canonical storefront page resolution chain:
 * requestedVariant -> convention page -> default page -> route fallback.
 */
export function resolveStorefrontPageCore({
    routeKey,
    routeComponent,
    storefrontConfig,
}: StorefrontPageResolverInput): StorefrontPageResolverResult {
    const pageRegistry = storefrontPageRegistry as Record<string, StorefrontPageComponent | undefined>
    const variantRegistry = storefrontPageVariantRegistry as Record<string, Record<string, StorefrontPageComponent> | undefined>
    const pagesVariants = storefrontConfig.pages?.variants as Record<string, string | undefined> | undefined

    const defaultComponent = pageRegistry[routeKey]
    const requestedVariant = pagesVariants?.[routeKey]
    const conventionComponent = resolveStorefrontConventionPage(storefrontConfig.id, routeKey)

    if (requestedVariant) {
        const variantComponent = variantRegistry[routeKey]?.[requestedVariant]

        if (variantComponent) {
            return {
                component: variantComponent,
                pageKey: routeKey,
                resolvedVariant: requestedVariant,
                fallbackApplied: false,
            }
        }

        if (conventionComponent) {
            return {
                component: conventionComponent,
                pageKey: routeKey,
                resolvedVariant: `${storefrontConfig.id}-convention`,
                fallbackApplied: true,
                fallbackReason: 'invalid-resolution',
            }
        }

        if (defaultComponent) {
            return {
                component: defaultComponent,
                pageKey: routeKey,
                resolvedVariant: 'default',
                fallbackApplied: true,
                fallbackReason: 'invalid-resolution',
            }
        }
    }

    if (conventionComponent) {
        return {
            component: conventionComponent,
            pageKey: routeKey,
            resolvedVariant: `${storefrontConfig.id}-convention`,
            fallbackApplied: false,
        }
    }

    if (defaultComponent) {
        return {
            component: defaultComponent,
            pageKey: routeKey,
            resolvedVariant: 'default',
            fallbackApplied: false,
        }
    }

    return {
        component: routeComponent,
        pageKey: routeKey,
        resolvedVariant: 'default',
        fallbackApplied: true,
        fallbackReason: 'missing-registry-entry',
    }
}
