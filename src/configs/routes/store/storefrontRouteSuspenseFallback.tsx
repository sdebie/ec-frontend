/**
 * Single primary Suspense fallback for lazy storefront route chunks (see StorefrontRoutes).
 */
export function StorefrontRouteSuspenseFallback() {
    return (
        <div className="mx-auto max-w-7xl animate-pulse space-y-4 p-8">
            <div className="h-8 max-w-xs rounded-md bg-(--sf-nav-border) opacity-40" />
            <div className="h-48 w-full rounded-md bg-(--sf-nav-border) opacity-30" />
            <p className="text-sm text-(--sf-muted-text)">Loading storefront content...</p>
        </div>
    )
}
