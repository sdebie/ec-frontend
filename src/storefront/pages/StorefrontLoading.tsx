// Rendered while /storefront/config is loading — the --sf-* theme variables
// do not exist yet at this point, so this page deliberately uses neutral
// hardcoded colours instead of theme tokens.
export function StorefrontLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-sm text-gray-500">Loading…</span>
    </div>
  )
}
