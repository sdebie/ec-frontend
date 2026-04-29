import {lazy} from 'react';
import type { ComponentType } from 'react';
import type {StorefrontPageComponent, StorefrontPageKey} from '@/types/storefront/storefrontPageContracts.ts';
import { storefrontPageImports } from 'virtual:storefront-page-map';
import {listStorefrontPageRoutes} from '@/configs/storefront/storefrontRouteContracts';
import {normalizeDiscoveredStorefrontPageKey} from '@/configs/storefront/storefrontPageKeyNormalization';

type StorefrontPageLoader = () => Promise<{ default: ComponentType<Record<string, unknown>> }>;

const getVirtualPage = (key: string): StorefrontPageComponent | undefined => {
    const loader = (storefrontPageImports as Record<string, StorefrontPageLoader>)[key];
    return loader ? lazy(loader) : undefined;
};

export const storefrontPageRegistry: Record<StorefrontPageKey, StorefrontPageComponent> =
    listStorefrontPageRoutes().reduce((registry, route) => {
        registry[route.key as StorefrontPageKey] = route.component as StorefrontPageComponent
        return registry
    }, {} as Record<StorefrontPageKey, StorefrontPageComponent>);

type StorefrontPageVariantRegistry = Partial<
    Record<StorefrontPageKey, Record<string, StorefrontPageComponent>>
>;

const toVariantToken = (tenantId: string, pageKey: string): string => {
    const kebabPageKey = pageKey.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
    return `${tenantId}-${kebabPageKey}`
}

const variantRegistry = Object.keys(storefrontPageImports).reduce(
    (registry, importKey) => {
        const [tenantId, discoveredPageKey] = importKey.split('/')
        if (!tenantId || !discoveredPageKey || tenantId === 'default') {
            return registry
        }

        const component = getVirtualPage(importKey)
        if (!component) {
            return registry
        }

        const typedPageKey = normalizeDiscoveredStorefrontPageKey(discoveredPageKey)
        if (!typedPageKey) {
            return registry
        }

        if (!storefrontPageRegistry[typedPageKey]) {
            return registry
        }

        const existingVariants = registry[typedPageKey] ?? {}
        return {
            ...registry,
            [typedPageKey]: {
                ...existingVariants,
                [toVariantToken(tenantId, typedPageKey)]: component,
            },
        }
    },
    {} as StorefrontPageVariantRegistry,
)

export const storefrontPageVariantRegistry: StorefrontPageVariantRegistry = variantRegistry
