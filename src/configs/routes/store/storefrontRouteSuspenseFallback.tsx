import { PageLoadingSpinner } from '@/components/shared/spinner/PageLoadingSpinner';

/**
 * Suspense fallback for lazy storefront route chunks (see StorefrontRoutes).
 * Renders a centred spinner using surface-aware --c-* tokens.
 */
export function StorefrontRouteSuspenseFallback() {
    return <PageLoadingSpinner />;
}
