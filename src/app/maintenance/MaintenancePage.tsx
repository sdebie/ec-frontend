/**
 * Full-site maintenance fallback, rendered by MaintenanceBoundary when an
 * unhandled render error escapes the router tree.
 *
 * Constraints for whoever designs the insides:
 * - This renders when anything below the boundary crashed — including the
 *   storefront config/theme load. `--sf-*` / `--c-*` tokens may therefore be
 *   undefined here; use plain values (same rule as StorefrontError /
 *   StorefrontLoading, the documented pre-theme exception).
 * - Keep `data-testid="maintenance-page"` on the root element — the boundary
 *   tests assert on it and are deliberately blind to everything else inside.
 */
export function MaintenancePage() {
    return (
        <div data-testid="maintenance-page" className="flex min-h-screen items-center justify-center p-8">
            {/* Design the maintenance experience here. */}
            <h1 className="text-xl font-semibold">We&apos;ll be right back</h1>
        </div>
    )
}
