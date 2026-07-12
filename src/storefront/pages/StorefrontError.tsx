interface Props {
  onRetry: () => void
}

// Rendered when /storefront/config fails to load — the --sf-* theme variables
// do not exist yet at this point, so this page deliberately uses neutral
// hardcoded colours instead of theme tokens.
export function StorefrontError({ onRetry }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-sm text-gray-500">
        Something went wrong loading the store. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        Retry
      </button>
    </div>
  )
}
