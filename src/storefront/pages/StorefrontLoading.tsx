// Rendered while /storefront/config is loading — the --sf-* theme variables
// do not exist yet at this point, so this page deliberately uses neutral
// hardcoded colours instead of theme tokens.
export function StorefrontLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      {/*
        role="status" carries the accessible name, so the spinner itself is
        decorative. `border-t-transparent` on a full ring is what makes the
        rotation visible — a uniform ring spinning looks static.
      */}
      <div role="status" aria-label="Loading">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
      <span aria-hidden="true" className="text-sm text-gray-500">
        Loading…
      </span>
    </div>
  )
}
