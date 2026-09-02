/**
 * Centred loading spinner — resolves --c-border/--c-accent via [data-surface],
 * falling back to neutral greys outside any surface context.
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
    )
}
