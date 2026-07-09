import { Link } from 'react-router-dom'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { formatAmount } from '@/shared/utils/formatAmount'
import { getDisplayPrice } from '../utils/pricing'
import { pickFeaturedImage } from '../utils/imageUtils'

interface PriceTier {
  price: number | null
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    images: Array<{
      imageUrl: string
      featured: boolean
      sortOrder: number
    }>
    retailPrice: PriceTier | null
    wholesalePrice: PriceTier | null
    retailSalePrice: PriceTier | null
    wholesaleSalePrice: PriceTier | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { currency, locale } = useStorefrontConfig()
  const customerType = useCustomerAuthStore((state) => state.customerType)

  const imageUrl = pickFeaturedImage(product.images)
  const { price, originalPrice } = getDisplayPrice(
    {
      retailPrice: product.retailPrice?.price ?? null,
      wholesalePrice: product.wholesalePrice?.price ?? null,
      retailSalePrice: product.retailSalePrice?.price ?? null,
      wholesaleSalePrice: product.wholesaleSalePrice?.price ?? null,
    },
    customerType,
  )

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          {originalPrice != null && (
            <span className="line-through text-gray-400">
              {formatAmount(originalPrice, currency, locale)}
            </span>
          )}
          <span className="font-semibold">
            {formatAmount(price, currency, locale)}
          </span>
        </div>
      </div>
    </Link>
  )
}
