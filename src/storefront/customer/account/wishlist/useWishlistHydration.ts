import { useQuery } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

export interface HydratedWishlistItem {
  variantId: string
  variantLabel: string
  sku: string
  productId: string
  productName: string
  productSlug: string
  imagePath: string | null
  retailPrice: { price: number | null } | null
  wholesalePrice: { price: number | null } | null
  retailSalePrice: { price: number | null; active: boolean } | null
  wholesaleSalePrice: { price: number | null; active: boolean } | null
  inStock: boolean | null
  productActive: boolean | null
}

interface HydrationResponse {
  items: HydratedWishlistItem[]
}

// The endpoint rejects requests above 50 IDs; larger wishlists are hydrated in chunks.
const CHUNK_SIZE = 50

export function useWishlistHydration(variantIds: string[]) {
  return useQuery({
    queryKey: ['wishlist', 'hydration', variantIds],
    queryFn: async () => {
      const chunks: string[][] = []
      for (let i = 0; i < variantIds.length; i += CHUNK_SIZE) {
        chunks.push(variantIds.slice(i, i + CHUNK_SIZE))
      }
      const results = await Promise.all(
        chunks.map((chunk) =>
          storefrontHttpClient
            .post<HydrationResponse>('/storefront/wishlist/hydrate', { variantIds: chunk })
            .then((r) =>
              r.data.items.map((item) => ({
                ...item,
                inStock: item.inStock ?? null,
                productActive: item.productActive ?? null,
              })),
            ),
        ),
      )
      return results.flat()
    },
    enabled: variantIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
