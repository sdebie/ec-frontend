import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts';
import type {ComponentType, LazyExoticComponent} from 'react';

export {CANONICAL_STOREFRONT_PAGE_KEYS} from '@/types/storefront/storefrontPageKeys.ts';
export type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys.ts';

export type StorefrontPageComponent = LazyExoticComponent<ComponentType<Record<string, unknown>>>;

/**
 * Minimal resolver input contract for Phase 1 (transparent mode).
 * routeKey is string (not StorefrontPageKey) to allow tenant-extra routes with non-canonical keys.
 */
export interface StorefrontPageResolverInput {
    routeKey: string;
    routeComponent: StorefrontPageComponent;
    storefrontConfig: StorefrontClientConfig;
}

/**
 * Minimal resolver result contract for Phase 1.
 * `component` must always be renderable; fallback can point to the original route component.
 */
export interface StorefrontPageResolverResult {
    component: StorefrontPageComponent;
    pageKey: string;
    // resolvedVariant: 'default';
    resolvedVariant: string; // 'default' or a registered variant id
    fallbackApplied: boolean;
    fallbackReason?: 'missing-registry-entry' | 'invalid-resolution';
}
