/**
 * Centred loading spinner — surface-aware via --c-* tokens.
 *
 * Works inside both [data-surface='storefront'] and [data-surface='admin']
 * because --c-border and --c-accent are defined by SurfaceProvider for both.
 * Falls back to neutral grays when rendered outside any surface context.
 */
export function PageLoadingSpinner() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div
                className="h-10 w-10 animate-spin rounded-full border-[3px]"
                style={{
                    borderColor: 'var(--c-border, #e5e7eb)',
                    borderTopColor: 'var(--c-accent, #2563eb)',
                }}
            />
        </div>
    );
}
