import type {ComponentType, LazyExoticComponent} from 'react';
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts';
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys.ts';

export {CANONICAL_STOREFRONT_PAGE_KEYS} from '@/types/storefront/storefrontPageKeys.ts';
export type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys.ts';

export type StorefrontPageComponent = LazyExoticComponent<ComponentType<Record<string, unknown>>>;

/**
 * Minimal resolver input contract for Phase 1 (transparent mode).
 */
export interface StorefrontPageResolverInput {
    routeKey: StorefrontPageKey;
    routeComponent: StorefrontPageComponent;
    storefrontConfig: StorefrontClientConfig;
}

/**
 * Minimal resolver result contract for Phase 1.
 * `component` must always be renderable; fallback can point to the original route component.
 */
export interface StorefrontPageResolverResult {
    component: StorefrontPageComponent;
    pageKey: StorefrontPageKey;
    // resolvedVariant: 'default';
    resolvedVariant: string; // 'default' or a registered variant id
    fallbackApplied: boolean;
    fallbackReason?: 'missing-registry-entry' | 'invalid-resolution';
}
