export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb placeholder */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-(--sf-surface-muted)" />
        <div className="h-4 w-4 rounded bg-(--sf-surface-muted)" />
        <div className="h-4 w-32 rounded bg-(--sf-surface-muted)" />
      </div>

      {/* Two-column layout: stacked on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: Image gallery placeholder */}
        <div>
          <div className="aspect-square w-full rounded-lg bg-(--sf-surface-muted)" />
          {/* Thumbnail strip */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-16 w-16 rounded bg-(--sf-surface-muted)" />
            ))}
          </div>
        </div>

        {/* Right: Content placeholders */}
        <div className="space-y-6">
          {/* Product name */}
          <div className="h-8 w-3/4 rounded bg-(--sf-surface-muted)" />

          {/* Short description */}
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-(--sf-surface-muted)" />
            <div className="h-4 w-5/6 rounded bg-(--sf-surface-muted)" />
          </div>

          {/* Variant selector buttons */}
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-(--sf-surface-muted)" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-10 w-16 rounded bg-(--sf-surface-muted)" />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="h-7 w-24 rounded bg-(--sf-surface-muted)" />

          {/* Add to cart button */}
          <div className="h-12 w-40 rounded-lg bg-(--sf-surface-muted)" />
        </div>
      </div>
    </div>
  )
}
