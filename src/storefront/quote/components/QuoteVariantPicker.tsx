import { Check, Loader2 } from 'lucide-react'
import { useProductDetail } from '@/storefront/catalog/hooks/useProductDetail'
import { parseAttributes } from '@/storefront/catalog/utils/imageUtils'
import { getDisplayPrice } from '@/storefront/catalog/utils/pricing'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'
import { useQuoteStore } from '../quoteStore'

interface QuoteVariantPickerProps {
  slug: string
  productName: string
  imageUrl?: string | null
}

/**
 * QuoteVariantPicker — inline variant chooser for multi-variant products in the
 * quote search. `shoppingProductList` only carries a variantId for SIMPLE
 * products, so variant products expand into this picker (fetched via the
 * existing `useProductDetail` hook — no new backend). Selecting a variant adds
 * it to the quote list with an attribute-derived label.
 */
export function QuoteVariantPicker({ slug, productName, imageUrl }: QuoteVariantPickerProps) {
  const { product, isLoading, isError } = useProductDetail(slug)
  const customerType = useCustomerAuthStore((s) => s.customerType)
  const { currency, locale } = useStorefrontConfig()
  const addItem = useQuoteStore((s) => s.addItem)
  const quoteItems = useQuoteStore((s) => s.items)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-(--sf-muted-text)">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        <span>Loading options...</span>
      </div>
    )
  }

  if (isError || !product || product.variants.length === 0) {
    return (
      <p className="px-4 py-3 text-xs text-(--sf-muted-text)">
        Options are unavailable for this product.
      </p>
    )
  }

  return (
    <ul
      className="divide-y divide-(--sf-border) border-t border-(--sf-border) bg-(--sf-surface-muted)/40"
      aria-label={`Options for ${productName}`}
    >
      {product.variants.map((variant) => {
        const attrs = parseAttributes(variant.attributesJson)
        const label = Object.values(attrs).join(' / ') || 'Standard'
        const { price, originalPrice } = getDisplayPrice(variant, customerType)
        const added = quoteItems.some((item) => item.variantId === variant.id)

        return (
          <li key={variant.id}>
            <button
              type="button"
              onClick={() => {
                if (added) return
                addItem({
                  variantId: variant.id,
                  productName,
                  variantLabel: label,
                  quantity: 1,
                  imageUrl: imageUrl ?? null,
                })
              }}
              disabled={added}
              className="flex w-full items-center gap-3 py-2.5 pl-8 pr-2 text-left transition-colors hover:bg-(--sf-surface-muted) disabled:cursor-default"
            >
              <span className="flex-1 truncate text-sm text-(--sf-text)">{label}</span>
              <span className="flex-shrink-0 text-right">
                {originalPrice != null && (
                  <span className="block text-xs line-through text-(--sf-muted-text)">
                    {formatAmount(originalPrice, currency, locale)}
                  </span>
                )}
                <span className="text-sm font-medium text-(--sf-text)">
                  {formatAmount(price, currency, locale)}
                </span>
              </span>
              {added && (
                <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-(--sf-accent)/10 px-2 py-0.5 text-xs font-medium text-(--sf-accent)">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Added
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
