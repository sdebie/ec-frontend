import { useRef } from 'react'
import { ProductCard } from './ProductCard'

interface PriceTier {
  price: number | null
}

interface Product {
  id: string
  name: string
  slug: string
  shortDescription: string
  images: Array<{ imageUrl: string; featured: boolean; sortOrder: number }>
  retailPrice: PriceTier | null
  wholesalePrice: PriceTier | null
  retailSalePrice: PriceTier | null
  wholesaleSalePrice: PriceTier | null
  variantId?: string | null
  sku?: string | null
  inStock?: boolean | null
}

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
  emptyMessage?: string
  /** Display mode: 'grid' (responsive multi-column) or 'list' (single-column rows). Default: 'grid'. */
  view?: 'grid' | 'list'
  /** Called with a product when its Quick view trigger is clicked. */
  onQuickView?: (product: Product, triggerRef: React.RefObject<HTMLButtonElement | null>) => void
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-(--sf-border) bg-(--sf-panel) overflow-hidden">
      <div className="aspect-square w-full bg-(--sf-surface-muted)" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-(--sf-surface-muted)" />
        <div className="h-4 w-1/2 rounded bg-(--sf-surface-muted)" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, isLoading, emptyMessage, view = 'grid', onQuickView }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 20 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-(--sf-muted-text)">
        {emptyMessage ?? 'No products found. Try adjusting your filters.'}
      </p>
    )
  }

  const containerClass =
    view === 'list'
      ? 'flex flex-col gap-4'
      : 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4'

  return (
    <div className={containerClass} data-view={view}>
      {products.map((product) => (
        <ProductGridItem
          key={product.id}
          product={product}
          view={view}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  )
}

/** Individual grid item — owns the trigger ref so each card has its own ref instance. */
function ProductGridItem({
  product,
  view,
  onQuickView,
}: {
  product: Product
  view: 'grid' | 'list'
  onQuickView?: (product: Product, triggerRef: React.RefObject<HTMLButtonElement | null>) => void
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  return (
    <ProductCard
      product={product}
      variantId={product.variantId}
      layout={view === 'list' ? 'row' : 'grid'}
      onQuickView={onQuickView ? () => onQuickView(product, triggerRef) : undefined}
      quickViewRef={triggerRef}
    />
  )
}
