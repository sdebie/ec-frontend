/**
 * Centred loading spinner — surface-aware via --c-* tokens.
 *
 * Fills the available container and centres the spinner vertically
 * and horizontally. Works inside both storefront and admin surfaces
 * because --c-border and --c-accent are defined by the [data-surface] CSS layer.
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
  )
}
